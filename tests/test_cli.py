# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test invenio-app-rdm CLI."""

import pytest
from invenio_access.utils import get_identity
from invenio_rdm_records.proxies import current_rdm_records_service


@pytest.fixture()
def user1_idty(users):
    """Return user and identity."""
    user = users["user1"]
    return user, get_identity(user)


def test_user_delete_non_existent(app, users, cli_runner):
    """Test deleting a non-existent user."""
    result = cli_runner("users", "delete", "999")
    assert "User 999 not found." in result.output


def test_user_delete_with_drafts(app, user1_idty, minimal_record, cli_runner):
    """Test deleting user with drafts fails."""
    user, idty = user1_idty
    # Create draft for user
    current_rdm_records_service.create(idty, minimal_record)

    result = cli_runner("users", "delete", str(user.id))
    assert "Aborted. User still has 1 drafts" in result.output


# def test_user_delete_with_records(app, user1_idty, cli_runner, users):
#     """Test deleting user with published records fails."""
#     user = users[0]
#     # Create and publish record for user
#     service = current_rdm_records_service
#     draft = service.create(get_identity(user), {})
#     service.publish(get_identity(user), draft.id)

#     result = cli_runner("users", "delete", str(user.id))
#     assert "Aborted. User still has 1 records" in result.output

# def test_user_delete_with_community(app, user1_idty, cli_runner, users):
#     """Test deleting user that belongs to a community fails."""
#     user = users[0]
#     # Add user to community
#     community = current_communities.service.create(system_identity, {
#         "title": "Test Community",
#         "type": "organization"
#     })
#     current_communities.service.members.add(system_identity, community.id,
#         [{"user": user.id, "role": "member"}])

#     result = cli_runner("users", "delete", str(user.id))
#     assert "Aborted. User part of communities:" in result.output

# def test_user_delete_with_request(app, user1_idty, cli_runner, users):
#     """Test deleting user with pending requests fails."""
#     user = users[0]
#     # Create request for user
#     current_requests_service.create(get_identity(user), {
#         "title": "Test request",
#         "type": "user-request"
#     })

#     result = cli_runner("users", "delete", str(user.id))
#     assert "Aborted. User part of communities:" in result.output

# def test_user_delete_user_declines(app, user1_idty, cli_runner, users):
#     """Test user deletion when user declines confirmation."""
#     user = users[0]
#     result = cli_runner("users", "delete", str(user.id), input="n\n")
#     assert "Aborted." in result.output
#     # Verify user still exists
#     assert current_datastore.get_user(user.id)

# def test_user_delete_success(app, user1_idty, cli_runner, users):
#     """Test successful user deletion."""
#     user = users[0]
#     result = cli_runner("users", "delete", str(user.id), input="y\n")
#     assert "Successfully deleted user." in result.output

#     # Verify user no longer exists
#     assert not current_datastore.get_user(user.id)
