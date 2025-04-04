# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration view module for audit logs."""

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
        "id": {
            "text": _("Log ID"),
            "order": 1,
            "width": 3,
        },
        "resource_type": {
            "text": _("Resource"),
            "order": 2,
        },
        "json.resource_id": { # Link to resource in the `resource_type` admin panel
            "text": _("Resource ID"),
            "order": 3,
        },
        "action": {
            "text": _("Action"),
            "order": 4,
        },
        "json.user.name": { # Link to user in user admin panel
            "text": _("Username"),
            "order": 5,
            "width": 1,
        },
        "created": {
            "text": _("Timestamp"),
            "order": 6,
            "width": 5,
        },
    }

    # actions = { # TODO: Add view button
    #     "view": {
    #         "text": _("View Raw Logs"),
    #         "payload_schema": None,
    #         "order": 1,
    #     },
    # }

    search_config_name = "AUDIT_LOGS_SEARCH"
    search_facets_config_name = "AUDIT_LOGS_FACETS"
    search_sort_config_name = "AUDIT_LOGS_SORT_OPTIONS"

