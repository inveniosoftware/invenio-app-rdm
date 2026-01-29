# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Administration views for managing roles."""

from flask import abort
from invenio_administration.views.base import (
    AdminResourceCreateView,
    AdminResourceDetailView,
    AdminResourceEditView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _

from ..users.permissions import can_access_user_administration


class RoleAdminMixin:
    """Shared configuration for role administration views."""

    resource_config = "groups_resource"
    extension_name = "invenio-users-resources"

    api_endpoint = "/groups"
    pid_path = "id"

    create_view_name = "roles_create"
    list_view_name = "roles"

    display_search = True
    display_delete = True
    display_create = True
    display_edit = True

    search_config_name = "USERS_RESOURCES_GROUPS_ADMIN_SEARCH"
    search_sort_config_name = "USERS_RESOURCES_GROUPS_ADMIN_SORT_OPTIONS"
    search_facets_config_name = "USERS_RESOURCES_GROUPS_ADMIN_FACETS"

    def dispatch_request(self, **kwargs):
        """Deny direct navigation to unauthorized users."""
        if not can_access_user_administration():
            abort(403)
        return super().get(**kwargs)


class RolesListView(RoleAdminMixin, AdminResourceListView):
    """List roles."""

    name = "roles"
    title = _("Roles")
    menu_label = _("Roles")
    category = _("User management")
    icon = "id badge"
    order = 30

    item_field_list = {
        "name": {"text": _("Name"), "order": 0, "width": 3},
        "id": {"text": _("ID"), "order": 1, "width": 3},
        "description": {"text": _("Description"), "order": 2, "width": 5},
        "is_managed": {"text": _("Managed"), "order": 3, "width": 1},
        "created": {"text": _("Created"), "order": 4, "width": 2},
    }

    search_request_headers = {"Accept": "application/json"}


class RolesDetailView(RoleAdminMixin, AdminResourceDetailView):
    """Role detail view."""

    url = "/roles/<pid_value>"
    name = "roles_detail"
    title = _("Role details")

    item_field_list = {
        "id": {"text": _("ID"), "order": 0},
        "name": {"text": _("Name"), "order": 1},
        "description": {"text": _("Description"), "order": 2},
        "is_managed": {"text": _("Managed"), "order": 3},
        "created": {"text": _("Created"), "order": 4},
        "updated": {"text": _("Updated"), "order": 5},
    }


class RolesCreateView(RoleAdminMixin, AdminResourceCreateView):
    """Role creation view."""

    name = "roles_create"
    url = "/roles/create"
    title = _("Create role")

    form_fields = {
        "name": {
            "order": 1,
            "text": _("Name"),
            "required": True,
        },
        "description": {
            "order": 2,
            "text": _("Description"),
        },
    }


class RolesEditView(RoleAdminMixin, AdminResourceEditView):
    """Role edit view."""

    name = "roles_edit"
    url = "/roles/<pid_value>/edit"
    title = _("Edit role")

    form_fields = RolesCreateView.form_fields
