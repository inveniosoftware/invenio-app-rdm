# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration users view module."""
from functools import partial

from flask import current_app
from invenio_administration.views.base import (
    AdminResourceDetailView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _
from invenio_search_ui.searchconfig import search_app_config

USERS_ITEM_LIST = {
    "username": {"text": _("Username"), "order": 1, "width": 4},
    "email": {"text": _("Email"), "order": 2, "width": 2},
    "active": {"text": _("Active"), "order": 3, "width": 1},
    "confirmed": {"text": _("Confirmed at"), "order": 4, "width": 1},
    "verified_at": {"text": _("Verified at"), "order": 5, "width": 2},
    "blocked_at": {"text": _("Blocked at"), "order": 6, "width": 2},
    "created": {"text": _("Created"), "order": 7, "width": 2},
    "updated": {"text": _("Updated"), "order": 8, "width": 2},
}


# List of the columns displayed on the user list and user details


class UsersListView(AdminResourceListView):
    """Configuration for users sets list view."""

    api_endpoint = "/users/moderation"
    extension_name = "invenio-users-resources"
    name = "users"
    resource_config = "users_resource"
    title = "User management"
    menu_label = "Users"
    category = "User management"
    pid_path = "id"
    icon = "users"

    display_search = True
    display_delete = False
    display_edit = False
    display_create = False

    item_field_list = USERS_ITEM_LIST

    search_config_name = "USERS_RESOURCES_SEARCH"
    search_sort_config_name = "USERS_RESOURCES_SORT_OPTIONS"
    search_facets_config_name = "USERS_RESOURCES_SEARCH_FACETS"
    template = "invenio_app_rdm/administration/users_search.html"

    # These actions are not connected on the frontend -
    # TODO: missing permission based links in resource
    actions = {
        "approve": {
            "text": "Approve",
            "payload_schema": None,
            "order": 1,
        },
        "restore": {
            "text": "Restore",
            "payload_schema": None,
            "order": 2,
        },
        "block": {
            "text": "Block",
            "payload_schema": None,
            "order": 2,
        },
        "Deactivate": {
            "text": "Suspend",
            "payload_schema": None,
            "order": 2,
        },
    }

    @staticmethod
    def disabled():
        """Disable the view on demand."""
        return not current_app.config["USERS_RESOURCES_ADMINISTRATION_ENABLED"]

    def init_search_config(self):
        """Build search view config."""
        return partial(
            search_app_config,
            config_name=self.get_search_app_name(),
            available_facets=current_app.config.get(self.search_facets_config_name),
            sort_options=current_app.config[self.search_sort_config_name],
            endpoint=self.get_api_endpoint(),
            headers=self.get_search_request_headers(),
            initial_filters=[["is_active", 1]],
            hidden_params=[],
            page=1,
            size=15,
        )


class UsersDetailView(AdminResourceDetailView):
    """Configuration for users sets detail view."""

    url = "/users/<pid_value>"
    api_endpoint = "/users/"
    search_request_headers = {"Accept": "application/json"}
    extension_name = "invenio-users-resources"
    name = "User details"
    resource_config = "users_resource"
    title = "User Details"
    display_delete = False
    display_edit = False

    pid_path = "username"
    item_field_list = USERS_ITEM_LIST
