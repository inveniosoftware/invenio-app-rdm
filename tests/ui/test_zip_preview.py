# SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
# SPDX-License-Identifier: MIT

"""Tests for ZIP preview validation errors and listing limits."""

import logging
from io import BytesIO
from unittest.mock import MagicMock
from zipfile import ZipFile

import pytest
from flask import url_for
from invenio_access.permissions import system_identity

from invenio_app_rdm.records_ui.previewer import previewable_zip


@pytest.fixture()
def zip_preview(monkeypatch):
    """Mock the listing service for focused rendering and error tests."""
    file = MagicMock(filename="archive.zip")
    file.record.__getitem__.return_value = "record-id"
    file.record._record.is_draft = False
    service = MagicMock()
    monkeypatch.setattr(previewable_zip, "current_rdm_records_service", service)
    return file, service.files.list_container


@pytest.mark.parametrize("truncated", [False, True])
def test_zip_preview_listing(base_app, zip_preview, truncated):
    """Render entries and show the listing-limit warning only when truncated."""
    file, list_container = zip_preview
    list_container.return_value.to_dict.return_value = {
        "entries": [
            {"key": "data.bin", "size": 10, "links": {"content": "/download/data.bin"}}
        ],
        "directories": [],
        "truncated": truncated,
    }
    with base_app.test_request_context():
        html = previewable_zip.preview(file)
    assert "data.bin" in html and "/download/data.bin" in html
    assert "This ZIP file cannot be previewed" not in html
    assert ("The previewer is not showing all the files." in html) is truncated
    assert ('class="ui attached warning message"' in html) is truncated


def test_zip_preview_unexpected_error(base_app, zip_preview):
    """Unexpected failures must not be disguised as validation rejections."""
    file, list_container = zip_preview
    list_container.side_effect = RuntimeError("Storage unavailable")
    with base_app.test_request_context():
        with pytest.raises(RuntimeError, match="Storage unavailable"):
            previewable_zip.preview(file)


@pytest.mark.parametrize("is_draft", [False, True], ids=["published", "draft"])
@pytest.mark.parametrize("invalid_zip", [False, True], ids=["limit", "non-zip"])
def test_zip_preview_rejection(
    running_app,
    draft_with_file,
    records_service,
    client_with_login,
    is_draft,
    invalid_zip,
    caplog,
):
    """Limit rejections and non-ZIP uploads render a panel and log at INFO."""
    draft = draft_with_file
    content = BytesIO(b"not a ZIP file")
    if not invalid_zip:
        content = BytesIO()
        with ZipFile(content, "w") as archive:
            archive.writestr("data.bin", b"test data")
        content.seek(0)
    files = records_service.draft_files
    files.init_files(system_identity, draft.id, [{"key": "archive.zip"}])
    files.set_file_content(system_identity, draft.id, "archive.zip", content)
    files.commit_file(system_identity, draft.id, "archive.zip")

    if not invalid_zip:
        # Reject a tiny ZIP using the real validator, then restore the config.
        config = running_app.app.config
        original_limit = config["RECORDS_RESOURCES_ZIP_MAX_ENTRIES"]
        try:
            config["RECORDS_RESOURCES_ZIP_MAX_ENTRIES"] = 0
            files.extract_file_metadata(system_identity, draft.id, "archive.zip")
        finally:
            config["RECORDS_RESOURCES_ZIP_MAX_ENTRIES"] = original_limit
    if not is_draft:
        records_service.publish(system_identity, draft.id)

    caplog.clear()
    caplog.set_level(logging.INFO, logger=running_app.app.logger.name)
    response = client_with_login.get(
        url_for(
            "invenio_app_rdm_records.record_file_preview",
            pid_value=draft.id,
            filename="archive.zip",
            preview=int(is_draft),
        )
    )
    html = response.get_data(as_text=True)
    assert response.status_code == 200
    assert "This ZIP file cannot be previewed" in html
    assert "tree list-unstyled" not in html
    logs = [r for r in caplog.records if "ZIP preview rejected" in r.getMessage()]
    assert len(logs) == 1
    assert logs[0].levelno == logging.INFO and logs[0].exc_info is None
    reason = "File is not a zip file" if invalid_zip else "Too many files"
    assert reason not in html
    for detail in (draft.id, "archive.zip", f"draft={is_draft}", reason):
        assert detail in logs[0].getMessage()
