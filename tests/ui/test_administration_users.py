# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Tests covering the administration users edit view."""

from invenio_accounts.proxies import current_datastore
from invenio_accounts.testutils import login_user_via_session
from invenio_users_resources.proxies import current_user_resources


class _csrf_disabled:
    """Context manager to temporarily disable CSRF."""

    def __init__(self, app):
        self.app = app
        self.original = app.config.get("WTF_CSRF_ENABLED", True)

    def __enter__(self):
        self.app.config["WTF_CSRF_ENABLED"] = False

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.app.config["WTF_CSRF_ENABLED"] = self.original


def _ensure_list_groups(monkeypatch):
    """Patch the users service list_groups when running against older services."""
    service = current_user_resources.users_service

    if hasattr(service, "list_groups"):
        return

    def _list_groups(id_, identity):
        user = current_datastore.get_user_by_id(id_)
        roles = getattr(user, "roles", []) or []
        hits = [
            {
                "id": getattr(role, "id", idx),
                "name": role.name,
                "description": getattr(role, "description", ""),
                "is_managed": getattr(role, "is_managed", False),
            }
            for idx, role in enumerate(roles)
        ]
        return {"hits": {"hits": hits}}

    monkeypatch.setattr(service, "list_groups", _list_groups, raising=False)


def test_user_roles_can_be_updated(
    monkeypatch, client, administration_user, users, roles
):
    """Assign and remove roles through the admin form."""
    login_user_via_session(client, email=administration_user.email)
    target = users["user2"]
    edit_url = f"/administration/users/{target.id}/edit"
    _ensure_list_groups(monkeypatch)

    # Assign role
    response = client.get(edit_url)
    assert response.status_code == 200

    with _csrf_disabled(client.application):
        response = client.post(
            edit_url,
            data={"roles": [roles["test"].name]},
            follow_redirects=True,
        )
    assert response.status_code == 200
    refreshed = current_datastore.get_user_by_id(target.id)
    assert roles["test"] in refreshed.roles

    # Remove all roles
    response = client.get(edit_url)
    assert response.status_code == 200
    with _csrf_disabled(client.application):
        response = client.post(
            edit_url,
            data={},
            follow_redirects=True,
        )
    assert response.status_code == 200
    refreshed = current_datastore.get_user_by_id(target.id)
    assert roles["test"] not in refreshed.roles
