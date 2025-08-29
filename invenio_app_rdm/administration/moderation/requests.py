# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Invenio administration view module for requests moderation."""

from functools import partial

from flask import current_app, g
from flask_login import current_user
from invenio_administration.views.base import (
    AdminResourceDetailView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.requests import RecordDeletion
from invenio_requests.proxies import current_requests
from invenio_search_ui.searchconfig import search_app_config
from invenio_users_resources.proxies import current_user_resources
from invenio_vocabularies.proxies import current_service as vocabulary_service
from marshmallow_utils.fields.babel import gettext_from_dict


class ModerationRequestListView(AdminResourceListView):
    """Requests moderation admin search view."""

    api_endpoint = "/requests"
    extension_name = "invenio-requests"
    name = "requests"
    resource_config = "requests_resource"
    request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}
    title = _("Requests")
    menu_label = _("Requests")
    category = _("Moderation")
    pid_path = "id"
    icon = "mail"
    template = "invenio_app_rdm/administration/requests.html"
    order = 1

    display_search = True
    display_delete = False
    display_create = False
    display_edit = False
    display_read = False

    search_config_name = "APP_RDM_MODERATION_REQUEST_SEARCH"
    search_facets_config_name = "APP_RDM_MODERATION_REQUEST_FACETS"
    search_sort_config_name = "APP_RDM_MODERATION_REQUEST_SORT_OPTIONS"

    item_field_list = {
        "type": {"text": _("Type"), "order": 1, "width": 3},
        "created": {"text": _("Created"), "order": 2, "width": 3},
        "last_reply": {"text": _("Last reply"), "order": 3, "width": 3},
    }

    @property
    def request_type(self):
        """Request type property."""
        request_type = self.resource.service.request_type_registry.lookup(
            "record-deletion"
        )
        return request_type

    @classmethod
    def get_service_schema(cls):
        """Get marshmallow schema of the assigned service."""
        request_type = cls.resource.service.request_type_registry.lookup(
            "record-deletion"
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
                ["type", RecordDeletion.type_id],
            ],
            pagination_options=(20, 50),
            default_size=20,
        )


class ModerationRequestDetailView(AdminResourceDetailView):
    """Configuration for moderation request detail view."""

    url = "/requests/<pid_value>"
    extension_name = "invenio-requests"
    api_endpoint = "/requests"
    name = "request_details"
    resource_config = "requests_resource"
    title = _("Request details")
    display_delete = False
    display_edit = False

    pid_path = "id"
    template = "invenio_app_rdm/administration/requests_details.html"

    @classmethod
    def get_service_schema(cls):
        """Get marshmallow schema of the assigned service."""
        request_type = cls.resource.service.request_type_registry.lookup(
            "record-deletion"
        )
        # handle dynamic schema class declaration for requests
        schema_cls = request_type.marshmallow_schema()
        schema = schema_cls()
        return schema

    def get_context(self, pid_value=None):
        """Create details view context."""
        name = self.name
        schema = self.get_service_schema()
        serialized_schema = self._schema_to_json(schema)
        fields = self.item_field_list
        request = current_requests.requests_service.read(
            id_=pid_value, identity=g.identity, expand=True
        ).to_dict()
        avatar = current_user_resources.users_service.links_item_tpl.expand(
            g.identity, current_user
        )["avatar"]
        permissions = []
        if "reason" in request["payload"]:
            reason_title = vocabulary_service.read(
                g.identity,
                ("removalreasons", request["payload"]["reason"]),
            ).to_dict()

            request["payload"]["reason_label"] = gettext_from_dict(
                reason_title["title"],
                current_i18n.locale,
                current_app.config.get("BABEL_DEFAULT_LOCALE", "en"),
            )

        return {
            "invenio_request": request,
            "user_avatar": avatar,
            "permissions": permissions,
            "request_headers": self.request_headers,
            "name": name,
            "resource_schema": serialized_schema,
            "fields": fields,
            "exclude_fields": self.item_field_exclude_list,
            "ui_config": self.item_field_list,
            "pid": pid_value,
            "api_endpoint": self.get_api_endpoint(),
            "title": self.title,
            "list_endpoint": self.get_list_view_endpoint(),
            "actions": self.serialize_actions(),
            "pid_path": self.pid_path,
            "display_edit": self.display_edit,
            "display_delete": self.display_delete,
            "list_ui_endpoint": self.get_list_view_endpoint(),
            "resource_name": (
                self.resource_name if self.resource_name else self.pid_path
            ),
        }
