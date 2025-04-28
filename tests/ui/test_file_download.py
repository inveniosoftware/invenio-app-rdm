# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 KTH Royal Institute of Technology.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

from flask import url_for


def test_file_download_with_and_without_preview_flag(
    client_with_login, draft_with_file
):
    """Test file download both with and without preview flag."""
    client = client_with_login
    draft_id = draft_with_file["id"]
    file_name = "article.txt"

    # The draft's owner should be able to download its file from the preview page
    url_with_preview = url_for(
        "invenio_app_rdm_records.record_file_download",
        pid_value=draft_id,
        filename=file_name,
        download=1,
        preview=1,
    )
    response = client.get(url_with_preview)
    assert (
        response.status_code == 200
    ), "File download with preview flag should return 200"

    # But since the draft isn't published yet, it can't be found without preview=1
    url_without_preview = url_for(
        "invenio_app_rdm_records.record_file_download",
        pid_value=draft_id,
        filename=file_name,
        download=1,
    )
    response = client.get(url_without_preview)
    assert (
        response.status_code == 404
    ), "File download without preview flag should return 404"


def test_nonexistent_file_returns_404(client_with_login, draft_with_file):
    """Test that requesting a non-existent file returns 404 via the NoResultFound handler."""
    client = client_with_login
    draft_id = draft_with_file["id"]
    fake_file = "nonexistent-file.pdf"

    # Downloads for files that don't exist should return a 404, both without...
    url_without_preview = url_for(
        "invenio_app_rdm_records.record_file_download",
        pid_value=draft_id,
        filename=fake_file,
        download=1,
    )
    response = client.get(url_without_preview)
    assert response.status_code == 404, "Non-existent file should return 404"

    # ... as well as with the preview=1 flag
    url_with_preview = url_for(
        "invenio_app_rdm_records.record_file_download",
        pid_value=draft_id,
        filename=fake_file,
        download=1,
        preview=1,
    )
    response = client.get(url_with_preview)
    assert (
        response.status_code == 404
    ), "Non-existent file with preview flag should return 404"
