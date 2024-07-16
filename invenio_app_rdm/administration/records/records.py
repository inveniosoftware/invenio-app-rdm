# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2023 Graz University of Technology.
#
# invenio-administration is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Invenio administration OAI-PMH view module."""

from functools import partial

from flask import current_app
from invenio_administration.views.base import AdminResourceListView
from invenio_i18n import lazy_gettext as _
from invenio_search_ui.searchconfig import search_app_config


class RecordAdminListView(AdminResourceListView):
    """Configuration for OAI-PMH sets list view."""

    api_endpoint = "/records"
    name = "Records"
    resource_config = "records_resource"
    search_request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}
    title = "Records"
    category = "Records & files"
    icon = "file"
    template = "invenio_app_rdm/administration/records/records.html"
    extension_name = "invenio-rdm-records"

    display_search = True
    display_delete = False
    display_edit = False
    display_create = False

    item_field_list = {
        "title": {"text": _("Title"), "order": 1, "width": 6},
        "owner": {"text": _("Owner"), "order": 2, "width": 1},
        "created": {"text": _("Created"), "order": 4, "width": 2},
        "files": {"text": _("Files"), "order": 5, "width": 1},
        "stats": {"text": _("Stats"), "order": 6, "width": 1},
    }

    actions = {
        "delete": {
            "text": _("Delete record"),
            "payload_schema": None,
            "order": 1,
        },
        "restore": {
            "text": _("Restore record"),
            "payload_schema": None,
            "order": 1,
        },
    }

    search_config_name = "RDM_SEARCH"
    search_facets_config_name = "RDM_FACETS"
    search_sort_config_name = "RDM_SORT_OPTIONS"

    def _get_delete_schema(self):
        return self.resource.service.config.schema_tombstone

    @classmethod
    def get_service_schema(cls):
        """Get marshmallow schema of the assigned service."""
        schema = cls.resource.service.config.schema()
        # handle dynamic schema class declaration for requests
        return schema

    def get_actions(self):
        """Get actions attribute."""
        actions = super().get_actions()
        actions["delete"]["payload_schema"] = self._get_delete_schema()
        return actions

    def init_search_config(self):
        """Build search view config."""
        return partial(
            search_app_config,
            config_name=self.get_search_app_name(),
            available_facets=current_app.config.get(self.search_facets_config_name),
            sort_options=current_app.config[self.search_sort_config_name],
            endpoint=self.get_api_endpoint(),
            headers=self.get_search_request_headers(),
            initial_filters=[["status", "P"]],
            hidden_params=[
                ["expand", "1"],
                ["include_deleted", "1"],
            ],
            page=1,
            size=30,
        )


class DraftAdminListView(AdminResourceListView):
    """Configuration for OAI-PMH sets list view."""

    api_endpoint = "/user/records"
    name = "Drafts"
    resource_config = "records_resource"
    search_request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}
    title = "Drafts"
    category = "Records & files"
    icon = "upload"
    template = "invenio_app_rdm/administration/records/drafts.html"
    extension_name = "invenio-rdm-records"

    display_search = True
    display_delete = False
    display_edit = False
    display_create = False

    item_field_list = {
        "title": {"text": _("Title"), "order": 1, "width": 6},
        "owner": {"text": _("Owner"), "order": 2, "width": 1},
        "created": {"text": _("Created"), "order": 4, "width": 2},
        "files": {"text": _("Files"), "order": 5, "width": 1},
        "stats": {"text": _("Stats"), "order": 6, "width": 1},
    }

    actions = {
        "set_quota": {
            "text": _("Set quota"),
            "payload_schema": None,
            "order": 1,
        },
    }

    search_config_name = "RDM_SEARCH_DRAFTS"
    search_facets_config_name = "RDM_FACETS"
    search_sort_config_name = "RDM_SORT_OPTIONS"

    def init_search_config(self):
        """Build search view config."""
        return partial(
            search_app_config,
            config_name=self.get_search_app_name(),
            # records facets, not drafts to avoid published/unpublished
            available_facets=current_app.config.get(self.search_facets_config_name),
            sort_options=current_app.config[self.search_sort_config_name],
            endpoint=self.get_api_endpoint(),
            headers=self.get_search_request_headers(),
            hidden_params=[
                ["expand", "1"],
                ["is_published", False],
                ["include_deleted", "1"],
            ],
            page=1,
            size=30,
        )
