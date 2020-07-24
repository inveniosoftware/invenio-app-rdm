# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Module tests."""

import json

import pytest
from invenio_accounts.testutils import login_user_via_view
from invenio_pidstore.minters import recid_minter
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_pidstore.providers.recordid_v2 import RecordIdProviderV2
from invenio_pidstore.proxies import current_pidstore

HEADERS = {"content-type": "application/json", "accept": "application/json"}
SINGLE_RECORD_API_URL = "https://localhost:5000/rdm-records/{}"
LIST_RECORDS_API_URL = "https://localhost:5000/records/"


@pytest.fixture(scope="function")
def app_with_custom_minter(app):
    """Application providing a minter creating unregistered pid values."""

    def custom_minter(record_uuid, data):
        """Custom class to mint a new pid in `NEW` state."""

        class CustomRecordIdProvider(RecordIdProviderV2):
            default_status_with_obj = PIDStatus.NEW

        provider = CustomRecordIdProvider.create(
            object_type='rec', object_uuid=record_uuid)
        data['recid'] = provider.pid.pid_value
        return provider.pid

    current_pidstore.minters['recid_v2'] = custom_minter
    yield app

    current_pidstore.minters['recid_v2'] = recid_minter


def test_record_read(client, location, minimal_record):
    """Retrieve a record."""
    # create a record
    response = client.post(LIST_RECORDS_API_URL, json=minimal_record)
    assert response.status_code == 201

    recid = response.json["id"]

    # retrieve record
    response = client.get(SINGLE_RECORD_API_URL.format(recid))
    assert response.status_code == 200
    assert response.json is not None


def test_record_read_non_existing_pid(client, location, minimal_record):
    """Retrieve a non existing record."""
    # retrieve unknown record
    response = client.get(SINGLE_RECORD_API_URL.format('notfound'))
    assert response.status_code == 404
    assert response.json["status"] == 404
    assert response.json["message"] == "The pid does not exist."


def test_record_read_unregistered_pid(app_with_custom_minter, location,
                                      minimal_record):
    """Retrieve a record with unregistered pid."""

    client = app_with_custom_minter.test_client()

    # create a record
    response = client.post(LIST_RECORDS_API_URL, json=minimal_record)
    assert response.status_code == 201
    recid = response.json["id"]

    response = client.get(SINGLE_RECORD_API_URL.format(recid), headers=HEADERS)
    assert response.status_code == 404

    assert response.json["status"] == 404
    assert response.json['message'] == "The pid is not registered."


def test_read_record_with_redirected_pid(client, location, minimal_record):
    """Test read a record with a redirected pid."""

    # Create dummy record
    response = client.post(
        LIST_RECORDS_API_URL, headers=HEADERS, data=json.dumps(minimal_record)
    )
    assert response.status_code == 201
    pid1 = PersistentIdentifier.get("recid", response.json["id"])

    # Create another dummy record
    response = client.post(
        LIST_RECORDS_API_URL, headers=HEADERS, data=json.dumps(minimal_record)
    )
    assert response.status_code == 201
    pid2 = PersistentIdentifier.get("recid", response.json["id"])

    # redirect pid1 to pid2
    pid1.redirect(pid2)

    response = client.get(SINGLE_RECORD_API_URL.format(pid1.pid_value),
                          headers=HEADERS)
    assert response.status_code == 301

    assert response.json["status"] == 301
    assert response.json['message'] == "Moved Permanently."


def test_read_deleted_record(client, location, minimal_record, users):
    """Test read a deleted record."""
    user1 = users['user1']
    # Login user1
    login_user_via_view(client, email=user1['email'],
                        password=user1['password'], login_url='/login')

    # Create dummy record to test delete
    response = client.post(
        LIST_RECORDS_API_URL, headers=HEADERS, data=json.dumps(minimal_record)
    )
    assert response.status_code == 201
    recid = response.json["id"]

    # Delete the record
    response = client.delete(SINGLE_RECORD_API_URL.format(recid),
                             headers=HEADERS)
    assert response.status_code == 204

    # Read the deleted record
    response = client.get(SINGLE_RECORD_API_URL.format(recid), headers=HEADERS)
    assert response.status_code == 410
    assert response.json['message'] == "The record has been deleted."
