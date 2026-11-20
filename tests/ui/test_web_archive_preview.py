# SPDX-FileCopyrightText: 2026 CERN.
# SPDX-License-Identifier: MIT

"""Web archive previews replayed on a separate host."""

import re
from datetime import datetime, timedelta, timezone
from html import unescape
from io import BytesIO
from urllib.parse import parse_qs, urlsplit

import pytest
import time_machine
from flask_principal import Identity
from invenio_access.permissions import any_user, authenticated_user, system_identity
from invenio_rdm_records.proxies import current_rdm_records_service as service
from invenio_records_resources.services.errors import PermissionDeniedError

MAIN = "https://127.0.0.1:5000"
ARCHIVE_HOST = "webarchive.localhost"
ARCHIVE = f"https://{ARCHIVE_HOST}"
WACZ = b"not really a wacz, only bytes to check what is served"


@pytest.fixture(scope="module")
def app_config(app_config):
    """Replay web archives on a separate host."""
    app_config["PREVIEWER_PREFERENCE"] = ["web_archive"]
    app_config["PREVIEWER_WEB_ARCHIVE_HOST"] = ARCHIVE_HOST
    app_config["TRUSTED_HOSTS"] = ["localhost", "127.0.0.1", ARCHIVE_HOST]
    app_config["SITE_UI_URL"] = MAIN
    return app_config


def _draft(users, files_access="public"):
    """Draft with a web archive file, owned by user1."""
    identity = Identity(users["user1"].id)
    identity.provides.add(any_user)
    identity.provides.add(authenticated_user)
    data = {
        "access": {"record": "public", "files": files_access},
        "files": {"enabled": True},
        "metadata": {
            "creators": [
                {
                    "person_or_org": {
                        "family_name": "Brown",
                        "given_name": "Troy",
                        "type": "personal",
                    }
                }
            ],
            "publication_date": "2020-06-01",
            "publisher": "Acme Inc",
            "resource_type": {"id": "image-photo"},
            "title": "A web archive",
        },
    }
    draft = service.create(identity, data)
    files = service.draft_files
    files.init_files(system_identity, draft.id, [{"key": "site.wacz"}])
    files.set_file_content(system_identity, draft.id, "site.wacz", BytesIO(WACZ))
    files.commit_file(system_identity, draft.id, "site.wacz")
    return draft


@pytest.fixture()
def public_record(running_app, users):
    """Published record with a public web archive file."""
    return service.publish(system_identity, _draft(users).id)


@pytest.fixture()
def restricted_record(running_app, users):
    """Published record with a restricted web archive file."""
    return service.publish(system_identity, _draft(users, "restricted").id)


@pytest.fixture()
def draft(running_app, users):
    """Unpublished draft with a web archive file."""
    return _draft(users)


def _archive_iframe(html):
    """Attributes of the iframe pointing at the archive host."""
    for tag in re.findall(r"<iframe\b[^>]*>", html):
        attrs = {k: unescape(v) for k, v in re.findall(r'([\w-]+)="([^"]*)"', tag)}
        if attrs.get("src", "").startswith(ARCHIVE + "/"):
            return attrs
    return None


def _preview(client, recid, query=""):
    res = client.get(f"{MAIN}/records/{recid}/preview/site.wacz{query}")
    assert res.status_code == 200
    return res.get_data(as_text=True)


def _source(client, recid, query=""):
    """File source given to the replay page."""
    iframe = _archive_iframe(_preview(client, recid, query))
    assert iframe is not None
    return parse_qs(urlsplit(iframe["src"]).query)["source"][0]


def test_preview_embeds_archive_host(client, public_record):
    """Nothing replays on the main origin, only an iframe to the archive host."""
    html = _preview(client, public_record.id)
    assert "<replay-web-page" not in html
    assert "replaywebpage/ui.js" not in html
    iframe = _archive_iframe(html)
    assert iframe is not None
    assert "allow-modals" not in iframe["sandbox"].split()


def test_replay_page(client, public_record):
    """The replay page can be framed by the main origin only."""
    iframe = _archive_iframe(_preview(client, public_record.id))
    res = client.get(iframe["src"])
    assert res.status_code == 200
    assert "<replay-web-page" in res.get_data(as_text=True)
    assert f"frame-ancestors {MAIN}" in res.headers["Content-Security-Policy"]
    assert "X-Frame-Options" not in res.headers
    assert "Set-Cookie" not in res.headers


def test_file_served_on_archive_host(client, public_record):
    """The token path serves the file without cookies."""
    source = _source(client, public_record.id)
    assert re.fullmatch(r"/web-archive-files/[^/]+/site\.wacz", source)
    res = client.get(ARCHIVE + source)
    assert res.status_code == 200
    assert res.get_data() == WACZ
    assert "Set-Cookie" not in res.headers


def test_restricted_file_anonymous(app, restricted_record):
    """Anonymous users get no token for a restricted file."""
    res = app.test_client().get(
        f"{MAIN}/records/{restricted_record.id}/preview/site.wacz"
    )
    assert _archive_iframe(res.get_data(as_text=True)) is None


def test_restricted_file_owner(app, client_with_login, restricted_record):
    """The owner's preview gives a token, used without the session."""
    source = _source(client_with_login, restricted_record.id)
    res = app.test_client().get(ARCHIVE + source)
    assert res.status_code == 200
    assert res.get_data() == WACZ


def test_no_token_without_content_access(client, public_record, monkeypatch):
    """Previewing needs access to the file's metadata, a token to its content."""

    def deny(*args, **kwargs):
        raise PermissionDeniedError()

    monkeypatch.setattr(service.files, "get_file_content", deny)
    assert _archive_iframe(_preview(client, public_record.id)) is None


def test_draft_file(app, client_with_login, draft):
    """Draft previews work for the owner."""
    source = _source(client_with_login, draft.id, "?preview=1")
    res = app.test_client().get(ARCHIVE + source)
    assert res.status_code == 200
    assert res.get_data() == WACZ


def test_expired_token(running_app, client, public_record):
    """Tokens expire."""
    source = _source(client, public_record.id)
    ttl = running_app.app.config["APP_RDM_WEB_ARCHIVE_TOKEN_TTL"]
    later = datetime.now(timezone.utc) + timedelta(seconds=ttl + 5)
    with time_machine.travel(later, tick=False):
        assert client.get(ARCHIVE + source).status_code == 403


def test_tampered_token(client, public_record):
    """Tokens can't be modified."""
    _, prefix, token, filename = _source(client, public_record.id).split("/")
    token = token[:-2] + ("AA" if token[-2:] != "AA" else "BB")
    assert client.get(f"{ARCHIVE}/{prefix}/{token}/{filename}").status_code == 403


def test_token_bound_to_file(client, public_record):
    """A token can't be used for another file name."""
    _, prefix, token, _ = _source(client, public_record.id).split("/")
    assert client.get(f"{ARCHIVE}/{prefix}/{token}/other.wacz").status_code == 403


def test_hosts_are_separated(client, public_record):
    """The token path only answers on the archive host, which serves nothing else."""
    source = _source(client, public_record.id)
    assert client.get(MAIN + source).status_code == 404
    for path in [
        "/",
        f"/records/{public_record.id}",
        f"/records/{public_record.id}/files/site.wacz",
    ]:
        assert client.get(ARCHIVE + path).status_code == 404, path
