# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from flask import abort, current_app, g, render_template, request
from invenio_files_rest.views import ObjectResource
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.resources.config import RDMDraftFilesResourceConfig, \
    RDMDraftResourceConfig
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services import RDMDraftFilesService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies

from ..utils import obj_or_import_string, previewer_record_file_factory


def register_records_ui_routes(app, blueprint):
    """Dynamically registers routes (allows us to rely on config)."""
    service = app.extensions["invenio-rdm-records"].records_service
    search_url = app.config.get("RDM_RECORDS_UI_SEARCH_URL", "/search")

    @blueprint.route(app.config.get("RDM_RECORDS_UI_NEW_URL", "/uploads/new"))
    def deposits_create():
        """Record creation page."""
        forms_config = dict(
            createUrl=("/api/records"),
            vocabularies=Vocabularies.dump(),
            current_locale=str(current_i18n.locale),
        )
        return render_template(
            current_app.config["DEPOSITS_FORMS_BASE_TEMPLATE"],
            forms_config=forms_config,
            record=dump_empty(RDMRecordSchema),
            files=dict(
                default_preview=None, enabled=True, entries=[], links={}
            ),
            searchbar_config=dict(searchUrl=search_url),
        )

    @blueprint.route(
        app.config.get("RDM_RECORDS_UI_EDIT_URL", "/uploads/<pid_value>")
    )
    def deposits_edit(pid_value):
        """Deposit edit page."""
        links_config = RDMDraftResourceConfig.links_config
        draft = service.read_draft(
            id_=pid_value, identity=g.identity, links_config=links_config
        )

        files_service = RDMDraftFilesService()
        files_list = files_service.list_files(
            id_=pid_value,
            identity=g.identity,
            links_config=RDMDraftFilesResourceConfig.links_config,
        )

        forms_config = dict(
            apiUrl=f"/api/records/{pid_value}/draft",
            vocabularies=Vocabularies.dump(),
            current_locale=str(current_i18n.locale),
        )

        # Dereference relations (languages, licenses, etc.)
        draft._record.relations.dereference()
        serializer = UIJSONSerializer()
        record = serializer.serialize_object_to_dict(draft.to_dict())

        # TODO: get the `is_published` field when reading the draft
        from invenio_pidstore.errors import PIDUnregistered

        try:
            service.draft_cls.pid.resolve(pid_value, registered_only=True)
            record["is_published"] = True
        except PIDUnregistered:
            record["is_published"] = False

        return render_template(
            current_app.config["DEPOSITS_FORMS_BASE_TEMPLATE"],
            forms_config=forms_config,
            record=record,
            files=files_list.to_dict(),
            searchbar_config=dict(searchUrl=search_url),
        )

    @blueprint.route(
        app.config.get("RDM_RECORDS_UI_SEARCH_USER_URL", "/uploads")
    )
    def deposits_user():
        """List of user deposits page."""
        return render_template(
            current_app.config["DEPOSITS_UPLOADS_TEMPLATE"],
            searchbar_config=dict(searchUrl=search_url),
        )

    @blueprint.route(
        app.config.get(
            "APP_RDM_RECORDS_EXPORT_URL",
            "/records/<pid_value>/export/<export_format>",
        )
    )
    def export_record(pid_value, export_format="json", **kwargs):
        """Record export-as landing page."""
        template = kwargs.get(
            "template", "invenio_app_rdm/landing_page/export_page.html"
        )

        resource = current_rdm_records.records_resource
        service = current_rdm_records.records_service
        links_config = resource.config.links_config

        record = service.read(
            id_=pid_value, identity=g.identity, links_config=links_config
        )._record

        # get the configured serializer
        temp = app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get(
            export_format
        )
        if temp is None:
            raise Exception(
                "no exporter for the specified format registered: {}".format(
                    export_format
                )
            )

        format_name = temp.get("name", export_format)
        serializer = obj_or_import_string(temp["serializer"])()
        exported_record = serializer.serialize_object(record)

        return render_template(
            template,
            export_format=format_name,
            exported_record=exported_record,
            record=record,
        )

    return blueprint


def file_download_ui(pid, record, _record_file_factory=None, **kwargs):
    """File download view for a given record.

    If ``download`` is passed as a querystring argument, the file is sent
    as an attachment.

    :param pid: The persistent identifier instance.
    :param record: The record metadata.
    """
    _record_file_factory = (
        _record_file_factory or previewer_record_file_factory
    )
    # Extract file from record.
    fileobj = _record_file_factory(pid, record, kwargs.get("filename"))
    if not fileobj:
        abort(404)

    obj = fileobj.obj

    # Check permissions
    # ObjectResource.check_object_permission(obj)

    # Send file.
    return ObjectResource.send_object(
        obj.bucket,
        obj,
        expected_chksum=fileobj.get("checksum"),
        logger_data={
            "bucket_id": obj.bucket_id,
            "pid_type": pid.pid_type,
            "pid_value": pid.pid_value,
        },
        as_attachment=("download" in request.args),
    )
