# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from functools import wraps

from flask import abort, current_app, g, render_template, request
from invenio_base.utils import obj_or_import_string
from invenio_files_rest.views import ObjectResource
from invenio_rdm_records.resources.serializers import UIJSONSerializer

from ..utils import previewer_record_file_factory
from .decorators import pass_record


#
# Views
#
@pass_record
def record_detail(record=None, pid_value=None):
    """Record detail page (aka landing page)."""
    return render_template(
        "invenio_app_rdm/records/detail.html",
        record=UIJSONSerializer().serialize_object_to_dict(record.to_dict()),
    )


@pass_record
def record_export(record=None, export_format=None, pid_value=None):
    """Export page view."""
    # Get the configured serializer
    exporter = current_app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get(
        export_format
    )
    if exporter is None:
        abort(404)

    serializer = obj_or_import_string(exporter["serializer"])(
        options={"indent": 2, "sort_keys": True, })
    exported_record = serializer.serialize_object(record.to_dict())

    return render_template(
        "invenio_app_rdm/records/export.html",
        export_format=exporter.get("name", export_format),
        exported_record=exported_record,
        record=UIJSONSerializer().serialize_object_to_dict(record.to_dict()),
    )


@pass_record
def record_file_preview(record=None, pid_value=None):
    """Render a preview of."""
    abort(404)


@pass_record
def record_file_download(record=None, pid_value=None):
    """Download a file from a record."""
    abort(404)
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


#
# Error handlers
#
def record_tombstone_error(error):
    """Tombstone page."""
    return render_template("invenio_app_rdm/records/tombstone.html"), 410
