# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C) 2024 Graz University of Technology.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Module tests."""

import pytest
from invenio_pidstore.models import PersistentIdentifier

SINGLE_RECORD_API_URL = "/records/{}"
LIST_RECORDS_API_URL = "/records"
DRAFT_API_URL = "/records/{}/draft"
DRAFT_ACTION_API_URL = "/records/{}/draft/actions/{}"


def test_record_read_non_existing_pid(client, location, minimal_record, es_clear):
    """Retrieve a non existing record."""
    # retrieve unknown record
    response = client.get(SINGLE_RECORD_API_URL.format("notfound"))
    assert response.status_code == 404
    assert response.json["status"] == 404
    assert response.json["message"] == "The persistent identifier does not exist."


def test_record_draft_create_and_read(
    client_with_login, running_app, minimal_record, es_clear
):
    """Test draft creation of a non-existing record."""
    # create a record
    client = client_with_login
    response = client.post(LIST_RECORDS_API_URL, json=minimal_record)

    assert response.status_code == 201

    response_fields = response.json.keys()
    fields_to_check = ["id", "metadata", "revision_id", "created", "updated", "links"]

    for field in fields_to_check:
        assert field in response_fields

    recid = response.json["id"]

    # retrieve record draft
    response = client.get(DRAFT_API_URL.format(recid))
    assert response.status_code == 200
    assert response.json is not None


def test_record_draft_publish(
    client_with_login, headers, running_app, minimal_record, es_clear
):
    """Test draft publication of a non-existing record.

    It has to first create said draft and includes record read.
    """
    # Create the draft
    client = client_with_login
    response = client.post(LIST_RECORDS_API_URL, json=minimal_record, headers=headers)

    assert response.status_code == 201
    recid = response.json["id"]

    # Publish it
    response = client.post(
        DRAFT_ACTION_API_URL.format(recid, "publish"), headers=headers
    )

    assert response.status_code == 202
    response_fields = response.json.keys()
    fields_to_check = ["id", "metadata", "revision_id", "created", "updated", "links"]

    for field in fields_to_check:
        assert field in response_fields

    response = client.get(DRAFT_API_URL.format(recid), headers=headers)
    assert response.status_code == 404

    # Test record exists
    response = client.get(SINGLE_RECORD_API_URL.format(recid), headers=headers)

    assert response.status_code == 200

    response_fields = response.json.keys()
    fields_to_check = ["id", "metadata", "revision_id", "created", "updated", "links"]

    for field in fields_to_check:
        assert field in response_fields


def test_read_record_with_redirected_pid(
    client_with_login, headers, running_app, minimal_record, es_clear
):
    """Test read a record with a redirected pid."""
    # Create dummy record
    client = client_with_login
    response = client.post(LIST_RECORDS_API_URL, headers=headers, json=minimal_record)
    assert response.status_code == 201
    # Publish it
    pid1_value = response.json["id"]
    response = client.post(
        DRAFT_ACTION_API_URL.format(pid1_value, "publish"), headers=headers
    )
    assert response.status_code == 202

    # Create another dummy record
    response = client.post(LIST_RECORDS_API_URL, headers=headers, json=minimal_record)
    assert response.status_code == 201
    pid2_value = response.json["id"]
    # Publish it
    response = client.post(
        DRAFT_ACTION_API_URL.format(pid2_value, "publish"), headers=headers
    )
    assert response.status_code == 202

    # redirect pid1 to pid2
    pid1 = PersistentIdentifier.get("recid", pid1_value)
    pid2 = PersistentIdentifier.get("recid", pid2_value)
    pid1.redirect(pid2)

    response = client.get(SINGLE_RECORD_API_URL.format(pid1.pid_value), headers=headers)
    assert response.status_code == 301

    assert response.json["status"] == 301
    assert response.json["message"] == "Moved Permanently."


@pytest.mark.skip()
def test_read_deleted_record(
    client_with_login, headers, location, minimal_record, es_clear, administration_user
):
    """Test read a deleted record."""
    client = client_with_login

    # Create dummy record to test delete
    response = client.post(LIST_RECORDS_API_URL, headers=headers, json=minimal_record)
    assert response.status_code == 201
    recid = response.json["id"]
    # Publish it
    response = client.post(
        DRAFT_ACTION_API_URL.format(recid, "publish"), headers=headers
    )
    assert response.status_code == 202

    # Delete the record
    response = client.delete(SINGLE_RECORD_API_URL.format(recid), headers=headers)
    assert response.status_code == 204

    # Read the deleted record
    response = client.get(SINGLE_RECORD_API_URL.format(recid), headers=headers)
    assert response.status_code == 410
    assert response.json["message"] == "The record has been deleted."


def test_record_search(client, headers, running_app, es_clear):
    """Test record search."""
    expected_response_keys = set(["hits", "links", "aggregations"])
    expected_metadata_keys = set(["resource_type", "creators", "titles"])

    # Get published bibliographic records
    response = client.get(LIST_RECORDS_API_URL, headers=headers)

    assert response.status_code == 200
    response_keys = set(response.json.keys())
    # The datamodel has other tests (jsonschemas, mappings, schemas)
    # Here we just want to crosscheck the important ones are there.
    assert expected_response_keys.issubset(response_keys)

    for r in response.json["hits"]["hits"]:
        metadata_keys = set(r["metadata"])
        assert expected_metadata_keys.issubset(metadata_keys)
