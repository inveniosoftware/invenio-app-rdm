# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Tests for tombstone/deleted record handling."""

from flask import url_for
from invenio_access.permissions import system_identity
from invenio_rdm_records.proxies import current_rdm_records_service as service


def test_deleted_record_shows_tombstone(client, record_with_file):
    """Test that a soft-deleted record shows the tombstone page (410)."""
    record_id = record_with_file.id

    # Record should be accessible before deletion
    record_url = url_for("invenio_app_rdm_records.record_detail", pid_value=record_id)
    response = client.get(record_url)
    assert response.status_code == 200

    # Delete the record (soft delete with tombstone)
    service.delete_record(system_identity, record_id, {})

    # Accessing the record should now show the tombstone page
    response = client.get(record_url)
    assert response.status_code == 410


def test_deleted_record_with_hidden_tombstone(client, record_with_file):
    """Test that a deleted record with hidden tombstone returns 404."""
    record_id = record_with_file.id

    # Delete the record with tombstone visibility set to False
    service.delete_record(system_identity, record_id, {"is_visible": False})

    # Accessing a record with hidden tombstone should return 404
    record_url = url_for("invenio_app_rdm_records.record_detail", pid_value=record_id)
    response = client.get(record_url)
    assert response.status_code == 404


def test_deleted_draft_returns_404(client, draft_with_file):
    """Test that accessing a deleted draft returns 404.

    When a draft is deleted, the PID is marked as DELETED but the underlying
    record object is removed. Accessing such a PID should return 404.
    """
    draft_id = draft_with_file.id
    service.delete_draft(system_identity, draft_id)

    record_url = url_for("invenio_app_rdm_records.record_detail", pid_value=draft_id)
    response = client.get(record_url)
    assert response.status_code == 404
