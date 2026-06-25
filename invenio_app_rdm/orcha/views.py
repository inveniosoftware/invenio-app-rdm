# SPDX-FileCopyrightText: 2026 CERN
# SPDX-License-Identifier: MIT
"""ORCHA views module."""

from datetime import datetime, timedelta, timezone

import jwt
import requests
from cryptography.hazmat.primitives import serialization
from flask import (
    Blueprint,
    Response,
    abort,
    current_app,
    g,
    jsonify,
    request,
    stream_with_context,
    url_for,
)
from invenio_access.permissions import system_identity
from invenio_files_rest.errors import InvalidOperationError
from invenio_rdm_records.proxies import current_rdm_records

from .client import OrchaClient

blueprint = Blueprint("orcha", __name__)


def _orcha_enabled():
    """Return if ORHCA is enabled."""
    enabled = current_app.config.get("RDM_DEPOSIT_ORCHA_ENABLED", False)
    return enabled() if callable(enabled) else bool(enabled)


def _require_orcha_enabled():
    """Require ORCHA to be enabled."""
    if not _orcha_enabled():
        abort(403)


def _orcha_client():
    """Build an ORCHA client from application configuration."""
    return OrchaClient(
        key_path=current_app.config.get("RDM_ORCHA_KEY_PATH"),
        key_id=current_app.config.get("RDM_ORCHA_KID"),
        tenant=current_app.config.get("RDM_ORCHA_TENANT"),
        base_url=current_app.config.get("RDM_ORCHA_URL"),
        public_url=current_app.config.get("RDM_ORCHA_PUBLIC_URL"),
        ssl_verify=current_app.config.get("RDM_ORCHA_SSL_VERIFY"),
    )


def _record_file(pid_value, key=None, identity=None):
    """Return a draft file by PID and optional file key."""
    service = current_rdm_records.records_service
    identity = identity if identity is not None else g.identity
    draft = service.read_draft(identity, pid_value)._record

    if not (draft.files and draft.files.entries):
        raise InvalidOperationError(description="Draft has no files")

    file_key = key or next(iter(draft.files.entries))
    if file_key not in draft.files.entries:
        raise InvalidOperationError(description="Draft file does not exist")

    return draft, file_key, draft.files[file_key]


def _file_download_url(pid_value, orcha, key=None):
    """Create a signed URL that ORCHA can use to download a draft file."""
    _require_orcha_enabled()

    draft, file_key, _ = _record_file(pid_value, key=key)
    service = current_rdm_records.records_service
    service.require_permission(g.identity, "manage", record=draft)

    return url_for(
        "orcha.download_orcha_file",
        pid_value=pid_value,
        key=file_key,
        token=_file_download_token(orcha, pid_value, file_key),
        _external=True,
    )


@blueprint.route("/uploads/<pid_value>/orcha", methods=["POST"])
def get_workflow_stream_url(pid_value):
    """Get an ORCHA workflow stream URL."""
    _require_orcha_enabled()

    if pid_value in {None, "", "null", "undefined"}:
        return (
            jsonify({"error": "Draft must be saved before extracting metadata."}),
            400,
        )

    orcha = _orcha_client()
    data = request.get_json(silent=True) or {}
    file_key = data.get("fileKey")
    payload = {
        "workflow_type": "extract_metadata",
        "params": {"url": _file_download_url(pid_value, orcha, key=file_key)},
    }

    try:
        response = orcha.trigger_workflow(payload, _workflow_token(orcha))
        workflow_id = response["public_id"]
        workflow_token = _workflow_token(orcha, workflow_id)
        return (
            jsonify(
                {
                    "workflowId": workflow_id,
                    "streamUrl": orcha.stream_url(
                        workflow_id,
                        workflow_token,
                    ),
                    "workflowUrl": url_for(
                        "orcha.orcha_proxy",
                        subpath=f"workflows/{workflow_id}",
                        token=workflow_token,
                    ),
                }
            ),
            200,
        )
    except requests.Timeout:
        return jsonify({"error": "Workflow service timed out."}), 504
    except requests.ConnectionError:
        return jsonify({"error": "Workflow service unavailable."}), 503
    except requests.HTTPError as exc:
        if exc.response is not None and exc.response.status_code in {401, 403}:
            return jsonify({"error": "Workflow service authorization failed."}), 502
        return jsonify({"error": "Failed to trigger workflow"}), 502


def _workflow_token(client, workflow_id=None, expiry=timedelta(minutes=30)):
    """Create a token for ORHCA workflow."""
    return jwt.encode(
        {
            "workflow_id": workflow_id or "*",
            "iss": client.tenant,
            "exp": datetime.now(timezone.utc) + expiry,
        },
        client.private_key,
        algorithm="RS256",
        headers={"kid": client.key_id},
    )


def _file_download_token(client, pid_value, key, expiry=timedelta(minutes=30)):
    """Create a token for downloading a file from the ORCHA route."""
    return jwt.encode(
        {
            "scope": "orcha:file-download",
            "pid": pid_value,
            "key": key,
            "iss": client.tenant,
            "exp": datetime.now(timezone.utc) + expiry,
        },
        client.private_key,
        algorithm="RS256",
        headers={"kid": client.key_id},
    )


def _verify_file_download_token(client, pid_value, key):
    """Verify an ORCHA draft file download token."""
    token = request.args.get("token")
    if not token:
        abort(401)

    private_key = client.private_key
    if isinstance(private_key, str):
        private_key = private_key.encode()

    public_key = serialization.load_pem_private_key(
        private_key, password=None
    ).public_key()

    try:
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=client.tenant,
        )
    except jwt.ExpiredSignatureError:
        abort(401)
    except jwt.InvalidTokenError:
        abort(401)

    if (
        claims.get("scope") != "orcha:file-download"
        or claims.get("pid") != pid_value
        or claims.get("key") != key
    ):
        abort(403)


@blueprint.route("/uploads/<pid_value>/orcha/files/<path:key>", methods=["GET"])
def download_orcha_file(pid_value, key):
    """Download an ORCHA file."""
    orcha = _orcha_client()
    _verify_file_download_token(orcha, pid_value, key)
    _, _, record_file = _record_file(pid_value, key=key, identity=system_identity)
    return record_file.object_version.send_file()


@blueprint.route("/orcha-proxy/<path:subpath>", methods=["GET"])
def orcha_proxy(subpath):
    """Proxy the subpath request to ORCHA."""
    _require_orcha_enabled()

    orcha = _orcha_client()
    upstream_url = f"{orcha.base_url}/{subpath}"
    params = request.args.to_dict(flat=False)
    upstream_headers = {}
    workflow_id = (
        subpath.removeprefix("workflows/") if subpath.startswith("workflows/") else ""
    )

    if workflow_id and "/" not in workflow_id:
        token = request.args.get("token")
        if token:
            upstream_headers["Authorization"] = f"Bearer {token}"
            params.pop("token", None)

    upstream = requests.get(
        upstream_url,
        params=params,
        headers=upstream_headers,
        stream=True,
        timeout=(10, None),
        verify=orcha.ssl_verify,
    )

    def generate():
        try:
            for chunk in upstream.iter_content(chunk_size=None):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }
    return Response(
        stream_with_context(generate()),
        status=upstream.status_code,
        headers=headers,
        mimetype=upstream.headers.get("Content-Type", "text/event-stream"),
    )
