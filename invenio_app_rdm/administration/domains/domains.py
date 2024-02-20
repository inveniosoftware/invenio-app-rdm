# -*- coding: utf-8 -*-
#
# Copyright (C) 2024 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration domains view module."""

from invenio_administration.views.base import (
    AdminResourceCreateView,
    AdminResourceDetailView,
    AdminResourceEditView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _


class DomainAdminMixin:
    """Common admin properties."""

    resource_config = "domains_resource"
    extension_name = "invenio-users-resources"

    api_endpoint = "/domains"
    pid_path = "domain"

    create_view_name = "domains_create"
    list_view_name = "domains"

    display_search = True
    display_delete = True
    display_create = True
    display_edit = True


class DomainsListView(DomainAdminMixin, AdminResourceListView):
    """Search admin view."""

    name = "domains"
    title = _("Domains")
    menu_label = _("Domains")
    category = _("Site management")
    icon = "world"

    item_field_list = {
        "domain": {"text": _("Domain"), "order": 1, "width": 3},
        "tld": {"text": _("TLD"), "order": 2, "width": 1},
        "status_name": {"text": _("Status"), "order": 3, "width": 1},
        "num_users": {"text": _("Users"), "order": 6, "width": 1},
        "num_active": {"text": _("Active"), "order": 7, "width": 1},
        "num_inactive": {"text": _("Inactive"), "order": 8, "width": 1},
        "num_confirmed": {"text": _("Confirmed"), "order": 9, "width": 1},
        "num_verified": {"text": _("Verified"), "order": 10, "width": 1},
        "num_blocked": {"text": _("Blocked"), "order": 11, "width": 1},
        "links": {"text": "", "order": 13, "width": 1},
    }

    search_config_name = "USERS_RESOURCES_DOMAINS_SEARCH"
    search_sort_config_name = "USERS_RESOURCES_DOMAINS_SORT_OPTIONS"
    search_facets_config_name = "USERS_RESOURCES_DOMAINS_SEARCH_FACETS"

    template = "invenio_app_rdm/administration/domains_search.html"

    search_request_headers = {"Accept": "application/vnd.inveniordm.v1+json"}


class FormMixin:
    """Mixin class for form fields."""

    form_fields = {
        "domain": {
            "order": 1,
            "text": _("Domain"),
            "description": _("Domain name (all lowercase)"),
        },
        "status_name": {
            "order": 2,
            "required": True,
            "text": _("Status"),
            "description": _(
                "Status of the domain. One of new (domain needs review), moderated (users in domain require moderation), verified (users in domain does not require moderation) or blocked (users cannot register using this domain)."
            ),
            "options": [
                {"title_l10n": "New", "id": "new"},
                {"title_l10n": "Moderated", "id": "moderated"},
                {"title_l10n": "Verified", "id": "verified"},
                {"title_l10n": "Blocked", "id": "blocked"},
            ],
            "placeholder": "Select a status",
        },
        "category_name": {
            "order": 3,
            "text": _("Category"),
            "description": _("A label to categorise the domain."),
            "options": [
                # TODO: Needs to be dynmaically loaded from domain category table.
                {"title_l10n": "Organization", "id": "organization"},
                {"title_l10n": "Company", "id": "company"},
                {"title_l10n": "Mail provider", "id": "mailprovider"},
                {"title_l10n": "Spammer", "id": "spammer"},
            ],
            "placeholder": "Select a category",
        },
        "flagged": {
            "order": 4,
            "text": _("Flagged"),
            "description": _(
                "Used by automatic processes to flag the domain as requiring review."
            ),
        },
        "flagged_source": {
            "order": 5,
            "text": _("Source of flag"),
            "description": _("Which source flagged the domain."),
        },
    }


class DomainsCreateView(DomainAdminMixin, FormMixin, AdminResourceCreateView):
    """Configuration for Banner create view."""

    name = "domains_create"
    url = "/domains/create"
    title = _("Create domain")


class DomainsEditView(DomainAdminMixin, FormMixin, AdminResourceEditView):
    """Domain edit view."""

    name = "domains_edit"
    url = "/domains/<pid_value>/edit"
    title = _("Edit domain")


class DomainsDetailView(DomainAdminMixin, AdminResourceDetailView):
    """Domain detail view."""

    url = "/domains/<pid_value>"
    name = "domains_details"
    title = _("Domain details")

    item_field_list = {
        "domain": {"text": _("Domain"), "order": 1},
        "tld": {"text": _("Top-level domain"), "order": 2},
        "status_name": {"text": _("Status"), "order": 3},
        "category_name": {"text": _("Category"), "order": 4},
        "flagged": {"text": _("Flagged"), "order": 5},
        "flagged_source": {"text": _("Source of flag"), "order": 6},
        "created": {"text": _("Created"), "order": 7},
        "updated": {"text": _("Updated"), "order": 8},
        "org": {"text": _("Organisation"), "order": 9},
        "num_users": {"text": _("Users"), "order": 10},
        "num_active": {"text": _("Active"), "order": 11},
        "num_inactive": {"text": _("Inactive"), "order": 12},
        "num_confirmed": {"text": _("Confirmed"), "order": 13},
        "num_verified": {"text": _("Verified"), "order": 14},
        "num_blocked": {"text": _("Blocked"), "order": 15},
    }
