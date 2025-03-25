# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration view module for audit logs."""

from functools import partial
from flask import current_app

from invenio_administration.views.base import AdminResourceListView
from invenio_i18n import lazy_gettext as _
from invenio_search_ui.searchconfig import search_app_config

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
        "_id": {
            "text": "Log ID",
            "order": 1,
            "width": 3,
        },
        "status": {
            "text": "Status",
            "order": 2,
            "width": 2,
        },
        "resource.type": {
            "text": "Resource",
            "order": 3,
        },
        "resource.id": {
            "text": "Resource ID",
            "order": 4,
        },
        "event.action": {
            "text": "Action",
            "order": 5,
        },
        "timestamp": {
            "text": "Date",
            "order": 6,
            "width": 3,
        },
    }

    search_config_name = "AUDIT_LOGS_SEARCH"
    search_facets_config_name = "AUDIT_LOGS_FACETS"
    search_sort_config_name = "AUDIT_LOGS_SORT_OPTIONS"

