# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprint used for loading templates.

The sole purpose of this blueprint is to ensure that Invenio can find the
templates and static files located in the folders of the same names next to
this file.
"""

from operator import itemgetter
from os.path import splitext

import idutils
from flask import Blueprint, abort, current_app, g, render_template, request
from flask_menu import current_menu
from invenio_files_rest.views import ObjectResource
from invenio_previewer.views import is_previewable
from invenio_rdm_records.resources import \
    BibliographicDraftFilesResourceConfig, BibliographicDraftResourceConfig
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services import BibliographicDraftFilesService, \
    BibliographicRecordService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies
from invenio_records_files.api import FileObject
from invenio_records_permissions.policies import get_record_permission_policy

from .utils import previewer_record_file_factory


def ui_blueprint(app):
    """Dynamically registers routes (allows us to rely on config)."""
    blueprint = Blueprint(
        'invenio_app_rdm',
        __name__,
        template_folder='templates',
        static_folder='static',
    )

    service = BibliographicRecordService()

    @blueprint.before_app_first_request
    def init_menu():
        """Initialize menu before first request."""
        item = current_menu.submenu('main.deposit')
        item.register(
            'invenio_app_rdm.deposits_user',
            'Uploads',
            order=1
        )

    search_url = app.config.get('RDM_RECORDS_UI_SEARCH_URL', '/search')

    @blueprint.route(search_url)
    def search():
        """Search page."""
        return render_template(current_app.config['SEARCH_BASE_TEMPLATE'])

    @blueprint.route(app.config.get('RDM_RECORDS_UI_NEW_URL', '/uploads/new'))
    def deposits_create():
        """Record creation page."""
        forms_config = dict(
            createUrl=("/api/records"),
            vocabularies=Vocabularies.dump(),
        )
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=dump_empty(RDMRecordSchema),
            files=dict(
                default_preview=None, enabled=True, entries=[], links={}
            ),
            searchbar_config=dict(searchUrl=search_url)
        )

    @blueprint.route(
        app.config.get('RDM_RECORDS_UI_EDIT_URL', '/uploads/<pid_value>')
    )
    def deposits_edit(pid_value):
        """Deposit edit page."""
        links_config = BibliographicDraftResourceConfig.links_config
        draft = service.read_draft(
            id_=pid_value, identity=g.identity, links_config=links_config)

        files_service = BibliographicDraftFilesService()
        files_list = files_service.list_files(
            id_=pid_value, identity=g.identity,
            links_config=BibliographicDraftFilesResourceConfig.links_config)

        forms_config = dict(
            apiUrl=f"/api/records/{pid_value}/draft",
            vocabularies=Vocabularies.dump()
        )

        # Dereference relations (languages, licenses, etc.)
        draft._record.relations.dereference()
        # TODO: get the `is_published` field when reading the draft
        _record = draft.to_dict()
        from invenio_pidstore.errors import PIDUnregistered
        try:
            _ = service.draft_cls.pid.resolve(
                    pid_value, registered_only=True)
            _record["is_published"] = True
        except PIDUnregistered:
            _record["is_published"] = False

        searchbar_config = dict(searchUrl=search_url)
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=_record,
            files=files_list.to_dict(),
            searchbar_config=searchbar_config
        )

    @blueprint.route(
        app.config.get('RDM_RECORDS_UI_SEARCH_USER_URL', '/uploads'))
    def deposits_user():
        """List of user deposits page."""
        return render_template(
            current_app.config['DEPOSITS_UPLOADS_TEMPLATE'],
            searchbar_config=dict(searchUrl=search_url)
        )

    @blueprint.route('/coming-soon')
    def coming_soon():
        """Route to display on soon-to-come features."""
        return render_template('invenio_app_rdm/coming_soon_page.html')

    @blueprint.app_template_filter()
    def make_files_preview_compatible(files):
        """Processes a list of RecordFiles to a list of FileObjects.

        This is needed to make the objects compatible with invenio-previewer.
        """
        file_objects = []
        for file in files:
            file_objects.append(
                FileObject(obj=files[file].object_version, data={}).dumps())
        return file_objects

    @blueprint.app_template_filter()
    def select_preview_file(files, default_preview=None):
        """Get list of files and select one for preview."""
        selected = None

        try:
            for f in sorted(files or [], key=itemgetter('key')):
                file_type = splitext(f['key'])[1][1:].lower()
                if is_previewable(file_type):
                    if selected is None:
                        selected = f
                    elif f['key'] == default_preview:
                        selected = f
        except KeyError:
            pass
        return selected

    @blueprint.app_template_filter()
    def to_previewer_files(record):
        """Get previewer-compatible files list."""
        return [FileObject(obj=f.object_version, data=f.metadata or {})
                for f in record.files.values()]

    @blueprint.app_template_filter('can_list_files')
    def can_list_files(record):
        """Permission check if current user can list files of record.

        The current_user is used under the hood by flask-principal.

        Once we move to Single-Page-App approach, we likely want to enforce
        permissions at the final serialization level (only).
        """
        PermissionPolicy = get_record_permission_policy()
        return PermissionPolicy(action='read_files', record=record).can()

    @blueprint.app_template_filter('pid_url')
    def pid_url(identifier, scheme=None, url_scheme='https'):
        """Convert persistent identifier into a link."""
        if scheme is None:
            try:
                scheme = idutils.detect_identifier_schemes(identifier)[0]
            except IndexError:
                scheme = None
        try:
            if scheme and identifier:
                return idutils.to_url(
                    identifier, scheme, url_scheme=url_scheme)
        except Exception:
            current_app.logger.warning(
                f"URL generation for identifier {identifier} failed.",
                exc_info=True
            )
        return ''

    @blueprint.app_template_filter('doi_identifier')
    def doi_identifier(identifiers):
        """Extract DOI from sequence of identifiers."""
        for identifier in identifiers:
            # TODO: extract this "DOI" constant to a registry?
            if identifier == 'doi':
                return identifiers[identifier]

    @blueprint.app_template_filter('vocabulary_title')
    def vocabulary_title(dict_key, vocabulary_key, alt_key=None):
        """Returns formatted vocabulary-corresponding human-readable string.

        In some cases the dict needs to be reconstructed. `alt_key` will be the
        key while `dict_key` will become the value.
        """
        if alt_key:
            dict_key = {alt_key: dict_key}
        vocabulary = Vocabularies.get_vocabulary(vocabulary_key)
        return vocabulary.get_title_by_dict(dict_key) if vocabulary else ""

    @blueprint.app_template_filter('dereference_record')
    def dereference_record(record):
        """Returns the UI serialization of a record."""
        record.relations.dereference()

        return record

    @blueprint.app_template_filter('serialize_ui')
    def serialize_ui(record):
        """Returns the UI serialization of a record."""
        serializer = UIJSONSerializer()
        # We need a dict not a string
        return serializer.serialize_object_to_dict(record)

    return blueprint


def file_download_ui(pid, record, _record_file_factory=None, **kwargs):
    """File download view for a given record.

    If ``download`` is passed as a querystring argument, the file is sent
    as an attachment.

    :param pid: The persistent identifier instance.
    :param record: The record metadata.
    """
    _record_file_factory = _record_file_factory or \
        previewer_record_file_factory
    # Extract file from record.
    fileobj = _record_file_factory(
        pid, record, kwargs.get('filename')
    )
    if not fileobj:
        abort(404)

    obj = fileobj.obj

    # Check permissions
    # ObjectResource.check_object_permission(obj)

    # Send file.
    return ObjectResource.send_object(
        obj.bucket, obj,
        expected_chksum=fileobj.get('checksum'),
        logger_data={
            'bucket_id': obj.bucket_id,
            'pid_type': pid.pid_type,
            'pid_value': pid.pid_value,
        },
        as_attachment=('download' in request.args)
    )
