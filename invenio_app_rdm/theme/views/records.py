# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from flask import abort, g, render_template, request
from invenio_files_rest.views import ObjectResource
from invenio_rdm_records.proxies import current_rdm_records

from ..utils import obj_or_import_string, previewer_record_file_factory


def register_records_ui_routes(app, blueprint):
    """Dynamically registers routes (allows us to rely on config)."""

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
        )

        # get the configured serializer
        exporter = app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get(
            export_format
        )
        if exporter is None:
            raise Exception(
                "no exporter for the specified format registered: {}".format(
                    export_format
                )
            )

        format_name = exporter.get("name", export_format)
        serializer = obj_or_import_string(exporter["serializer"])()
        exported_record = serializer.serialize_object(record.to_dict())

        return render_template(
            template,
            export_format=format_name,
            exported_record=exported_record,
            record=record,
            pid_value=record.id,
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
