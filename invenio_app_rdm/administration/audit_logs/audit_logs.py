# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration view module for audit logs."""
from flask import current_app
from invenio_administration.views.base import AdminResourceListView
from invenio_i18n import lazy_gettext as _


class AuditLogListView(AdminResourceListView):
    """Audit logs admin search view."""

    api_endpoint = "/audit-logs/"
    extension_name = "invenio-audit-logs"
    name = "audit-logs"
    resource_config = "audit_log_resource"

    title = "Audit Logs"
    menu_label = "Audit Logs"
    category = "Logs"
    pid_path = "id"
    icon = "file alternate"
    template = "invenio_app_rdm/administration/audit_logs.html"
    order = 1
    search_request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}

    display_search = True
    display_delete = False
    display_create = False
    display_edit = False

    item_field_list = {
        "resource.type": {
            "text": _("Resource"),
            "order": 1,
            "width": 2,
        },
        "resource.id": {
            "text": _("Resource ID"),
            "order": 2,
        },
        "action": {
            "text": _("Action"),
            "order": 3,
        },
        "user.id": {
            "text": _("User"),
            "order": 4,
        },
        "created": {
            "text": _("Created"),
            "order": 5,
        },
    }

    actions = {
        "view_log": {
            "text": _("View Log"),
            "payload_schema": None,
            "order": 1,
        },
        "view_changes": {
            "text": _("View Changes"),
            "payload_schema": None,
            "order": 2,
            "show_for": ["record.publish"],
        },
    }

    search_config_name = "AUDIT_LOGS_SEARCH"
    search_facets_config_name = "AUDIT_LOGS_FACETS"
    search_sort_config_name = "AUDIT_LOGS_SORT_OPTIONS"

    @staticmethod
    def disabled():
        """Disable the view on demand."""
        return not current_app.config["AUDIT_LOGS_ENABLED"]
