# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test files-rest is protected."""

from io import BytesIO


def create_draft(client, record, headers):
    """Create draft and return its id."""
    response = client.post("/records", json=record, headers=headers)
    assert response.status_code == 201
    return response.json['id']


def init_file(client, recid, headers):
    """Init a file for draft with given recid."""
    return client.post(
        f'/records/{recid}/draft/files',
        headers=headers,
        json=[{'key': 'test.pdf'}]
    )


def upload_file(client, recid):
    """Create draft and return its id."""
    return client.put(
        f"/records/{recid}/draft/files/test.pdf/content",
        headers={
            'content-type': 'application/octet-stream',
            'accept': 'application/json',
        },
        data=BytesIO(b'testfile'),
    )


def commit_file(client, recid, headers):
    """Create draft and return its id."""
    return client.post(
        f"/records/{recid}/draft/files/test.pdf/commit",
        headers=headers
    )


# NOTE: It seems like it was already the case that a logged in user wouldn't be
#       able to access files-rest. We are just making doubly-clear.
def test_files_rest_endpoint_is_protected(
        running_app, client_with_login, headers, es_clear, minimal_record):
    client = client_with_login

    # Create draft with file
    minimal_record["files"] = {"enabled": True}
    recid = create_draft(client, minimal_record, headers)
    init_file(client, recid, headers)
    upload_file(client, recid)
    commit_file(client, recid, headers)

    # Get bucket information
    url = f"/records/{recid}/draft/files/test.pdf"
    response = client.get(url, headers=headers)
    bucket_id = response.json["bucket_id"]

    # Nobody is allowed to use the invenio-files-rest endpoints
    # (even logged-in user). Just testing for the GET of each is enough

    bucket_url = f"/files/{bucket_id}"
    response = client.get(bucket_url, headers=headers)
    assert 404 == response.status_code  # because of files-rest hiding feature

    bucket_key_url = f"/files/{bucket_id}/test.pdf"
    response = client.get(bucket_key_url, headers=headers)
    assert 404 == response.status_code
