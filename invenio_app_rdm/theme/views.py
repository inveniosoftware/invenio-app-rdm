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

from flask import Blueprint, config, current_app, g, render_template
from flask_menu import current_menu
from invenio_rdm_records.resources import \
    BibliographicDraftFilesResourceConfig, BibliographicDraftResourceConfig
from invenio_rdm_records.services import BibliographicDraftFilesService, \
    BibliographicRecordService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies


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

    return blueprint
