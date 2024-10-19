# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2024 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Invenio administration view module for user moderation."""

from functools import partial

from flask import current_app
from invenio_administration.views.base import (
    AdminResourceDetailView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _
from invenio_requests.customizations.user_moderation import UserModerationRequest
from invenio_search_ui.searchconfig import search_app_config


class UserModerationListView(AdminResourceListView):
    """User moderation admin search view."""

    api_endpoint = "/requests"
    extension_name = "invenio-requests"
    name = "moderation"
    resource_config = "requests_resource"
    request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}
    title = _("Moderation")
    menu_label = _("Moderation")
    category = _("Moderation")
    pid_path = "id"
    icon = "users"
    template = "invenio_app_rdm/administration/user_moderation.html"
    order = 1

    display_search = True
    display_delete = False
    display_create = False
    display_edit = False

    item_field_list = {
        # custom display of the values - only declared to create columns
        "expanded.topic.user": {
            "text": _("User"),
            "order": 2,
            "width": 4,
        },
        # custom display of the values - only declared to create columns
        "expanded.topic.user.profile.email": {
            "text": _("Email"),
            "order": 3,
            "width": 2,
        },
        # custom display of the values - only declared to create columns
        "domain": {
            "text": _("Email domain"),
            "order": 4,
            "width": 2,
        },
        # custom display of the values - only declared to create columns
        "activity": {
            "text": _("Activity"),
            "order": 5,
            "width": 4,
        },
        "status": {
            "text": _("Status"),
            "order": 6,
            "width": 2,
        },
    }

    actions = {
        "accept": {
            "text": _("Approve"),
            "payload_schema": None,
            "order": 1,
        },
        "decline": {
            "text": _("Block"),
            "payload_schema": None,
            "order": 2,
        },
    }
    search_config_name = "REQUESTS_USER_MODERATION_SEARCH"
    search_facets_config_name = "REQUESTS_USER_MODERATION_FACETS"
    search_sort_config_name = "REQUESTS_USER_MODERATION_SORT_OPTIONS"

    @property
    def request_type(self):
        """Request type property."""
        request_type = self.resource.service.request_type_registry.lookup(
            "user-moderation"
        )
        return request_type

    @classmethod
    def get_service_schema(cls):
        """Get marshmallow schema of the assigned service."""
        request_type = cls.resource.service.request_type_registry.lookup(
            "user-moderation"
        )
        # handle dynamic schema class declaration for requests
        schema_cls = request_type.marshmallow_schema()
        schema = schema_cls()
        return schema

    @staticmethod
    def disabled():
        """Disable the view on demand."""
        return False

    def init_search_config(self):
        """Build search view config."""
        return partial(
            search_app_config,
            config_name=self.get_search_app_name(),
            available_facets=current_app.config.get(self.search_facets_config_name),
            sort_options=current_app.config[self.search_sort_config_name],
            endpoint=self.get_api_endpoint(),
            headers=self.get_search_request_headers(),
            initial_filters=[["is_open", "true"]],
            hidden_params=[
                ["expand", "1"],
                ["type", UserModerationRequest.type_id],
            ],
            pagination_options=(20, 50),
            default_size=20,
        )


class UserModerationRequestDetailView(AdminResourceDetailView):
    """Admin community detail view."""

    url = "/moderation/<pid_value>"
    extension_name = "invenio-requests"
    api_endpoint = "/requests"
    name = "user-moderation-details"
    resource_config = "requests_resource"
    title = _("User moderation")

    display_delete = False
    display_edit = False

    list_view_name = "communities"
    pid_path = "id"
    request_headers = {"Accept": "application/json"}
    template = "invenio_app_rdm/administration/user_moderation_details.html"

    @classmethod
    def get_service_schema(cls):
        """Get marshmallow schema of the assigned service."""
        request_type = cls.resource.service.request_type_registry.lookup(
            "user-moderation"
        )
        # handle dynamic schema class declaration for requests
        schema_cls = request_type.marshmallow_schema()
        schema = schema_cls()
        return schema

    item_field_list = {
        "id": {
            "text": _("ID"),
            "order": 1,
        },
        "topic.user": {
            "text": _("User"),
            "order": 3,
        },  # TODO we should resolve the user. But this is fetched from the API.
        # TODO can we dereference somehow?
        "created": {"text": _("Created"), "order": 2},
        "is_open": {"text": _("Open"), "order": 4},
    }
