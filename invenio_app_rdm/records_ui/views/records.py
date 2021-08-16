# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from os.path import splitext

from flask import abort, current_app, g, redirect, render_template, request, \
    url_for
from flask_login import current_user
from invenio_base.utils import obj_or_import_string
from invenio_previewer.extensions import default
from invenio_previewer.proxies import current_previewer
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from marshmallow import ValidationError

from .decorators import pass_file_item, pass_file_metadata, pass_is_preview, \
    pass_record_files, pass_record_from_pid, pass_record_latest, \
    pass_record_or_draft


class PreviewFile:
    """Preview file implementation for InvenioRDM.

    This class was apparently created because of subtle differences with
    `invenio_previewer.api.PreviewFile`.
    """

    def __init__(self, file_item, record_pid_value, url=None):
        """Create a new PreviewFile."""
        self.file = file_item
        self.data = file_item.data
        self.size = self.data["size"]
        self.filename = self.data["key"]
        self.bucket = self.data["bucket_id"]
        self.uri = url or url_for(
            "invenio_app_rdm_records.record_file_download",
            pid_value=record_pid_value,
            filename=self.filename
        )

    def is_local(self):
        """Check if file is local."""
        return True

    def has_extensions(self, *exts):
        """Check if file has one of the extensions.

        Each `exts` has the format `.{file type}` e.g. `.txt` .
        """
        file_ext = splitext(self.data["key"])[1].lower()
        return file_ext in exts

    def open(self):
        """Open the file."""
        return self.file._file.file.storage().open()


#
# Views
#
@pass_is_preview
@pass_record_or_draft
@pass_record_files
def record_detail(record=None, files=None, pid_value=None, is_preview=False):
    """Record detail page (aka landing page)."""
    files_dict = None if files is None else files.to_dict()
    record_ui = UIJSONSerializer().serialize_object_to_dict(record.to_dict())
    is_draft = record._record.is_draft
    if is_preview and is_draft:
        try:
            current_rdm_records.records_service.validate_draft(
                g.identity, record.id
            )
        except ValidationError:
            abort(404)
    return render_template(
        "invenio_app_rdm/records/detail.html",
        record=record_ui,
        pid=pid_value,
        files=files_dict,
        permissions=record.has_permissions_to(['edit', 'new_version', 'manage',
                                               'update_draft', 'read_files']),
        is_preview=is_preview,
        is_draft=is_draft,
    )


@pass_is_preview
@pass_record_or_draft
def record_export(
    record=None,
    export_format=None,
    pid_value=None,
    permissions=None,
    is_preview=False
):
    """Export page view."""
    # Get the configured serializer
    exporter = current_app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get(
        export_format
    )
    if exporter is None:
        abort(404)

    serializer = obj_or_import_string(exporter["serializer"])(
        options={
            "indent": 2,
            "sort_keys": True,
        }
    )
    exported_record = serializer.serialize_object(record.to_dict())
    return render_template(
        "invenio_app_rdm/records/export.html",
        export_format=exporter.get("name", export_format),
        exported_record=exported_record,
        record=UIJSONSerializer().serialize_object_to_dict(record.to_dict()),
        permissions=record.has_permissions_to(['update_draft']),
        is_preview=is_preview,
        is_draft=record._record.is_draft
    )


@pass_is_preview
@pass_record_or_draft
@pass_file_metadata
def record_file_preview(
    record=None,
    pid_value=None,
    pid_type="recid",
    file_metadata=None,
    is_preview=False,
    **kwargs
):
    """Render a preview of the specified file."""
    # Try to see if specific previewer is set
    # TODO: what's the analog of: file_previewer = fileobj.get("previewer") ?
    file_previewer = file_metadata.data.get("previewer")

    url = url_for(
            "invenio_app_rdm_records.record_file_download",
            pid_value=pid_value,
            filename=file_metadata.data["key"],
            preview=1 if is_preview else 0
        )
    # Find a suitable previewer
    fileobj = PreviewFile(file_metadata, pid_value, url)
    for plugin in current_previewer.iter_previewers(
        previewers=[file_previewer] if file_previewer else None
    ):
        if plugin.can_preview(fileobj):
            return plugin.preview(fileobj)

    return default.preview(fileobj)


@pass_is_preview
@pass_file_item
def record_file_download(
    file_item=None,
    pid_value=None,
    is_preview=False,
    **kwargs
):
    """Download a file from a record."""
    download = bool(request.args.get("download"))
    return file_item.send_file(as_attachment=download)


@pass_record_latest
def record_latest(record=None, **kwargs):
    """Redirect to record'd latest version page."""
    return redirect(record["links"]["self_html"], code=301)


@pass_record_from_pid
def record_from_pid(record=None, **kwargs):
    """Redirect to record'd latest version page."""
    return redirect(record["links"]["self_html"], code=301)


#
# Error handlers
#
def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config['THEME_404_TEMPLATE']), 404


def record_tombstone_error(error):
    """Tombstone page."""
    return render_template("invenio_app_rdm/records/tombstone.html"), 410


def record_permission_denied_error(error):
    """Handle permission denier error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()
    return render_template(current_app.config['THEME_403_TEMPLATE']), 403
