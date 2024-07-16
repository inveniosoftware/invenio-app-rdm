# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C) 2021-2023 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

import itertools
from os.path import splitext
from pathlib import Path

from flask import abort, current_app, g, redirect, render_template, request, url_for
from flask_login import current_user
from invenio_base.utils import obj_or_import_string
from invenio_communities.communities.resources.serializer import (
    UICommunityJSONSerializer,
)
from invenio_communities.errors import CommunityDeletedError
from invenio_communities.proxies import current_communities
from invenio_communities.views.communities import render_community_theme_template
from invenio_previewer.extensions import default as default_previewer
from invenio_previewer.proxies import current_previewer
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.records.systemfields.access.access_settings import (
    AccessSettings,
)
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_stats.proxies import current_stats
from invenio_users_resources.proxies import current_user_resources
from marshmallow import ValidationError

from invenio_app_rdm.records_ui.previewer.iiif_simple import (
    previewable_extensions as image_extensions,
)

from ..utils import get_external_resources
from .decorators import (
    add_signposting,
    pass_file_item,
    pass_file_metadata,
    pass_include_deleted,
    pass_is_preview,
    pass_record_files,
    pass_record_from_pid,
    pass_record_latest,
    pass_record_media_files,
    pass_record_or_draft,
)
from .deposits import get_user_communities_memberships, load_custom_fields


def get_record_community(record):
    """Return record's active community if any.

    A record has an active community when:
        - has either a request associated with a community
        - or has been published to a community
        - and the resolved i.e expanded community is not a "tombstone" i.e unknown

    Returns a tuple with the resolved community or None and the community id
    """
    parent = record.get("parent", {})
    community_review = parent.get("review", {}).get("receiver", {}).get("community")
    community_default = parent.get("communities", {}).get("default")
    community_id = community_default or community_review
    expanded_parent = record.get("expanded", {}).get("parent", {})
    expanded_community = expanded_parent.get("review", {}).get(
        "receiver"
    ) or expanded_parent.get("communities", {}).get("default")

    if community_review or community_default:
        is_community_pid_deleted = expanded_community.get("is_ghost", False)
        if is_community_pid_deleted:
            # community pid is not found in search i.e its pid is deleted
            return None, community_id

        # resolve the community again to check the deletion status
        # deleted communities with tombstones are not identified as ghost records
        # at the moment because `read_many()` function is not filtering them out
        try:
            community = current_communities.service.read(
                id_=community_id, identity=g.identity
            )
            # community has not tombstone
            return community, community_id
        except CommunityDeletedError:
            return None, community_id
    else:
        return None, None


class PreviewFile:
    """Preview file implementation for InvenioRDM.

    This class was apparently created because of subtle differences with
    `invenio_previewer.api.PreviewFile`.
    """

    def __init__(self, file_item, record_pid_value, record=None, url=None):
        """Create a new PreviewFile."""
        self.file = file_item
        self.data = file_item.data
        self.record = record
        self.size = self.data["size"]
        self.filename = self.data["key"]
        self.bucket = self.data["bucket_id"]
        self.uri = url or url_for(
            "invenio_app_rdm_records.record_file_download",
            pid_value=record_pid_value,
            filename=self.filename,
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
@pass_include_deleted
@pass_record_or_draft(expand=True)
@pass_record_files
@pass_record_media_files
@add_signposting
def record_detail(
    pid_value, record, files, media_files, is_preview=False, include_deleted=False
):
    """Record detail page (aka landing page)."""
    files_dict = None if files is None else files.to_dict()
    media_files_dict = None if media_files is None else media_files.to_dict()

    access = record._record.parent["access"]
    if "settings" not in access or access["settings"] is None:
        record._record.parent["access"]["settings"] = AccessSettings({}).dump()

    record_ui = UIJSONSerializer().dump_obj(record.to_dict())
    is_draft = record_ui["is_draft"]
    custom_fields = load_custom_fields()
    # keep only landing page configurable custom fields
    custom_fields["ui"] = [
        cf for cf in custom_fields["ui"] if not cf.get("hide_from_landing_page", False)
    ]
    avatar = None

    if current_user.is_authenticated:
        avatar = current_user_resources.users_service.links_item_tpl.expand(
            g.identity, current_user
        )["avatar"]

    if is_preview and is_draft:
        # it is possible to save incomplete drafts that break the normal
        # (preview) landing page rendering
        # to prevent this from happening, we validate the draft's structure
        # see: https://github.com/inveniosoftware/invenio-app-rdm/issues/1051
        try:
            current_rdm_records.records_service.validate_draft(
                g.identity, record.id, ignore_field_permissions=True
            )
        except ValidationError:
            abort(404)
        # inject parent doi format for new drafts so we can show in preview
        if current_app.config["DATACITE_ENABLED"]:
            service = current_rdm_records.records_service
            datacite_provider = [
                v["datacite"]
                for p, v in service.config.parent_pids_providers.items()
                if p == "doi" and "datacite" in v
            ]
            if datacite_provider:
                datacite_provider = datacite_provider[0]
                parent_doi = datacite_provider.client.generate_doi(
                    record._record.parent
                )
                record_ui["ui"]["new_draft_parent_doi"] = parent_doi

    # emit a record view stats event
    emitter = current_stats.get_event_emitter("record-view")
    if record is not None and emitter is not None:
        emitter(current_app, record=record._record, via_api=False)

    record_owner = (
        record_ui.get("expanded", {})
        .get("parent", {})
        .get("access", {})
        .get("owned_by", {})
    )
    resolved_community, _ = get_record_community(record_ui)
    resolved_community = (
        UICommunityJSONSerializer().dump_obj(resolved_community.to_dict())
        if resolved_community
        else None
    )
    theme = resolved_community.get("theme", {}) if resolved_community else None

    return render_community_theme_template(
        current_app.config.get("APP_RDM_RECORD_LANDING_PAGE_TEMPLATE"),
        theme=theme,
        record=record_ui,
        files=files_dict,
        media_files=media_files_dict,
        user_communities_memberships=get_user_communities_memberships(),
        permissions=record.has_permissions_to(
            [
                "edit",
                "new_version",
                "manage",
                "update_draft",
                "read_files",
                "review",
                "view",
                "media_read_files",
                "moderate",
            ]
        ),
        custom_fields_ui=custom_fields["ui"],
        is_preview=is_preview,
        include_deleted=include_deleted,
        is_draft=is_draft,
        community=resolved_community,
        external_resources=get_external_resources(record),
        user_avatar=avatar,
        record_owner_username=(
            record_owner.get("username")
        ),  # record created with system_identity have not owners e.g demo
    )


@pass_is_preview
@pass_record_or_draft(expand=False)
def record_export(
    pid_value, record, export_format=None, permissions=None, is_preview=False
):
    """Export page view."""
    # Get the configured serializer
    exporter = current_app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get(export_format)
    if exporter is None:
        abort(404)

    serializer = obj_or_import_string(exporter["serializer"])(
        **exporter.get("params", {})
    )
    exported_record = serializer.serialize_object(record.to_dict())
    contentType = exporter.get("content-type", export_format)
    filename = exporter.get("filename", export_format).format(id=pid_value)
    headers = {
        "Content-Type": contentType,
        "Content-Disposition": f"attachment; filename={filename}",
    }
    return (exported_record, 200, headers)


@pass_is_preview
@pass_include_deleted
@pass_record_or_draft(expand=False)
@pass_file_metadata
def record_file_preview(
    pid_value,
    record=None,
    pid_type="recid",
    file_metadata=None,
    is_preview=False,
    include_deleted=False,
    **kwargs,
):
    """Render a preview of the specified file."""
    url = url_for(
        "invenio_app_rdm_records.record_file_download",
        pid_value=pid_value,
        filename=file_metadata.data["key"],
        preview=1 if is_preview else 0,
    )

    # Find a suitable previewer
    fileobj = PreviewFile(file_metadata, pid_value, record, url)
    # Try to see if specific previewer preference is set for the file
    file_previewer = (file_metadata.data.get("metadata") or {}).get("previewer")
    if file_previewer:
        previewer = current_previewer.previewers.get(file_previewer)
        if previewer and previewer.can_preview(fileobj):
            return previewer.preview(fileobj)

    # Go through all previewers to find the first one that can preview the file
    for plugin in current_previewer.iter_previewers():
        if plugin.can_preview(fileobj):
            return plugin.preview(fileobj)

    return default_previewer.preview(fileobj)


@pass_is_preview
@pass_file_item(is_media=False)
@add_signposting
def record_file_download(pid_value, file_item=None, is_preview=False, **kwargs):
    """Download a file from a record."""
    download = bool(request.args.get("download"))

    # emit a file download stats event
    emitter = current_stats.get_event_emitter("file-download")
    if file_item is not None and emitter is not None:
        obj = file_item._file.object_version
        emitter(current_app, record=file_item._record, obj=obj, via_api=False)

    return file_item.send_file(as_attachment=download)


@pass_record_or_draft(expand=False)
def record_thumbnail(pid_value, size, record=None, **kwargs):
    """Display a record's thumbnail."""
    # Verify against allowed thumbnail sizes
    if size not in current_app.config["APP_RDM_RECORD_THUMBNAIL_SIZES"]:
        abort(404)
    files = record.data.get("files", {})
    default_preview = files.get("default_preview")
    file_entries = files.get("entries", {})
    if file_entries:
        file_key = next(
            (
                key
                for key in itertools.chain([default_preview], file_entries)
                if key and Path(key).suffix[1:] in image_extensions
            ),
            None,
        )
        if file_key:
            file = current_rdm_records.records_service.files.read_file_metadata(
                id_=pid_value, file_key=file_key, identity=g.identity
            )
            iiif_base_url = file["links"]["iiif_base"]
            return redirect(f"{iiif_base_url}/full/{size},/0/default.png")
    return abort(404)


# Media files download


@pass_is_preview
@pass_file_item(is_media=True)
def record_media_file_download(pid_value, file_item=None, is_preview=False, **kwargs):
    """Download a media file from a record."""
    download = bool(request.args.get("download"))

    # emit a file download stats event
    emitter = current_stats.get_event_emitter("file-download")
    if file_item is not None and emitter is not None:
        obj = file_item._file.object_version
        emitter(current_app, record=file_item._record, obj=obj, via_api=False)

    return file_item.send_file(as_attachment=download)


@pass_record_latest
def record_latest(record=None, **kwargs):
    """Redirect to record's latest version page."""
    return redirect(record["links"]["self_html"], code=302)


@pass_record_from_pid
def record_from_pid(record=None, **kwargs):
    """Redirect to record's latest version page."""
    return redirect(record["links"]["self_html"], code=302)


#
# Error handlers
#
def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config["THEME_404_TEMPLATE"]), 404


def draft_not_found_error(error):
    """Handler for draft not found while published record exists."""
    return (
        render_template(
            "invenio_app_rdm/records/draft_not_found.html",
            record_id=error.pid_value,
        ),
        404,
    )


def record_tombstone_error(error):
    """Tombstone page."""
    # the RecordDeletedError will have the following properties,
    # while the PIDDeletedError won't
    record = getattr(error, "record", None)
    if (record_ui := getattr(error, "result_item", None)) is not None:
        if record is None:
            record = record_ui._record

        record_ui = UIJSONSerializer().dump_obj(record_ui.to_dict())

    # render a 404 page if the tombstone isn't visible
    if not record.tombstone.is_visible:
        return not_found_error(error)

    # we only render a tombstone page if there is a record with a visible tombstone
    return (
        render_template(
            "invenio_app_rdm/records/tombstone.html",
            record=record_ui,
        ),
        410,
    )


def record_permission_denied_error(error):
    """Handle permission denied error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()

    record = getattr(error, "record", None)

    if record:
        is_restricted = record.get("access", {}).get("record", None) == "restricted"
        has_doi = "doi" in record.get("pids", {})
        if is_restricted and has_doi:
            return (
                render_template(
                    "invenio_app_rdm/records/restricted_with_doi_tombstone.html",
                    record=record,
                ),
                403,
            )

    return render_template(current_app.config["THEME_403_TEMPLATE"]), 403
