# SPDX-FileCopyrightText: 2026 CERN.
# SPDX-License-Identifier: MIT

"""Web archive files served on the web archive host.

The web archive host never has the user's session, so the preview (which has
already checked access to the file) gives it a short-lived token for that one
file.
"""

from flask import abort, current_app, g, url_for
from invenio_access.permissions import system_identity
from invenio_pidstore.errors import PersistentIdentifierError
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.services.errors import RecordDeletedException
from invenio_records_resources.services.errors import (
    FileKeyNotFoundError,
    PermissionDeniedError,
)
from itsdangerous import BadData, URLSafeTimedSerializer
from sqlalchemy.orm.exc import NoResultFound

from ..views.records import PreviewContainerItem


def _serializer():
    return URLSafeTimedSerializer(
        current_app.config["SECRET_KEY"], salt="invenio-app-rdm-web-archive"
    )


def _files_service(draft):
    service = current_rdm_records_service
    return service.draft_files if draft else service.files


def web_archive_source(file):
    """Token path serving a record's (or draft's) file on the web archive host.

    Only given if the current user may download the file: previewing only needs
    access to the file's metadata.
    """
    # The token covers a whole file, not an item inside a container
    if isinstance(file, PreviewContainerItem) or file.record is None:
        return None
    recid, draft = file.record.id, file.record._record.is_draft
    try:
        _files_service(draft).get_file_content(g.identity, recid, file.filename)
    except PermissionDeniedError:
        return None

    token = _serializer().dumps({"recid": recid, "key": file.filename, "draft": draft})
    return url_for(
        "invenio_app_rdm_records.record_web_archive_file",
        token=token,
        filename=file.filename,
    )


def record_web_archive_file(token, filename):
    """Serve the file a token was given for."""
    try:
        data = _serializer().loads(
            token, max_age=current_app.config["APP_RDM_WEB_ARCHIVE_TOKEN_TTL"]
        )
    except BadData:
        abort(403)
    if data["key"] != filename:
        abort(403)

    files = _files_service(data["draft"])
    try:
        item = files.get_file_content(system_identity, data["recid"], data["key"])
    except (
        FileKeyNotFoundError,
        NoResultFound,
        PersistentIdentifierError,
        RecordDeletedException,
    ):
        abort(404)
    return item.send_file()
