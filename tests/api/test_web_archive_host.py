# SPDX-FileCopyrightText: 2026 CERN.
# SPDX-License-Identifier: MIT

"""The REST API doesn't answer on the web archive host."""

import pytest

ARCHIVE_HOST = "webarchive.localhost"


@pytest.fixture(scope="module")
def app_config(app_config):
    """Replay web archives on a separate host."""
    app_config["PREVIEWER_WEB_ARCHIVE_HOST"] = ARCHIVE_HOST
    app_config["TRUSTED_HOSTS"] = ["localhost", "127.0.0.1", ARCHIVE_HOST]
    return app_config


def test_api_not_on_archive_host(running_app, client):
    """Archived pages can't call the API on their own host."""
    res = client.get(f"https://{ARCHIVE_HOST}/records")
    assert res.status_code == 404
    assert "Set-Cookie" not in res.headers
    assert client.get("https://127.0.0.1:5000/records").status_code == 200
