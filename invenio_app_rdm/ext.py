# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio Research Data Management."""

import warnings
from datetime import timedelta

from flask import request
from flask_menu import current_menu
from invenio_i18n import lazy_gettext as _

from .communities_ui.views.ui import _show_browse_page


def _is_branded_community():
    """Function used to check if community is branded."""
    community = request.community
    if community.get("theme", {}).get("enabled", False):
        return True
    return False


def finalize_app(app):
    """Finalize app."""
    init_menu(app)
    init_config(app)


def init_config(app):
    """Initialize configuration."""
    record_doi_required = (
        app.config["RDM_PERSISTENT_IDENTIFIERS"].get("doi", {}).get("required")
    )
    parent_doi_required = (
        app.config["RDM_PARENT_PERSISTENT_IDENTIFIERS"].get("doi", {}).get("required")
    )

    if record_doi_required != parent_doi_required:
        raise Exception(
            "Config variables RDM_PERSISTENT_IDENTIFIERS.doi.required and "
            "RDM_PARENT_PERSISTENT_IDENTIFIERS.doi.required must be set to the same value."
        )

    if "COMMUNITIES_GROUPS_ENABLED" in app.config:
        warnings.warn(
            "COMMUNITIES_GROUPS_ENABLED config variable is deprecated. Please use USERS_RESOURCES_GROUPS_ENABLED "
            "instead. For now, COMMUNITIES_GROUPS_ENABLED value will be taken into account and features related to "
            "groups will be disabled if this was the intention.",
            DeprecationWarning,
        )

        if not app.config["COMMUNITIES_GROUPS_ENABLED"]:
            app.config["USERS_RESOURCES_GROUPS_ENABLED"] = False

    # validate grace period
    grace_period = app.config["RDM_RECORDS_RESTRICTION_GRACE_PERIOD"]
    if not isinstance(grace_period, timedelta) or grace_period.total_seconds() < 0:
        raise TypeError(
            "RDM_RECORDS_RESTRICTION_GRACE_PERIOD config value must be of type datetime.timedelta with a "
            "duration greater than or equal to 0. "
        )


def init_menu(app):
    """Init menu."""
    current_menu.submenu("actions.deposit").register(
        endpoint="invenio_app_rdm_users.uploads",
        text=_("My dashboard"),
        order=1,
    )

    current_menu.submenu("plus.deposit").register(
        endpoint="invenio_app_rdm_records.deposit_create",
        text=_("New upload"),
        order=1,
    )

    current_menu.submenu("notifications.requests").register(
        "invenio_app_rdm_users.requests",
        order=1,
    )

    user_dashboard = current_menu.submenu("dashboard")
    # set dashboard-config to its default
    user_dashboard_menu_config = {
        "uploads": {
            "endpoint": "invenio_app_rdm_users.uploads",
            "text": _("Uploads"),
            "order": 1,
        },
        "communities": {
            "endpoint": "invenio_app_rdm_users.communities",
            "text": _("Communities"),
            "order": 2,
        },
        "requests": {
            "endpoint": "invenio_app_rdm_users.requests",
            "text": _("Requests"),
            "order": 3,
        },
    }

    # apply dashboard-config overrides
    for submenu_name, submenu_kwargs in app.config[
        "USER_DASHBOARD_MENU_OVERRIDES"
    ].items():
        if submenu_name not in user_dashboard_menu_config:
            raise ValueError(
                f"attempting to override dashboard's submenu `{submenu_name}`, "
                "but dashboard has no registered submenu of that name"
            )
        user_dashboard_menu_config[submenu_name].update(submenu_kwargs)

    # register dashboard-menus
    for submenu_name, submenu_kwargs in user_dashboard_menu_config.items():
        user_dashboard.submenu(submenu_name).register(**submenu_kwargs)

    communities = current_menu.submenu("communities")
    communities.submenu("home").register(
        "invenio_app_rdm_communities.communities_home",
        text=_("Home"),
        order=5,
        visible_when=_is_branded_community,
        expected_args=["pid_value"],
        **dict(icon="home", permissions="can_read"),
    )
    communities.submenu("browse").register(
        endpoint="invenio_app_rdm_communities.communities_browse",
        text=_("Browse"),
        order=15,
        visible_when=_show_browse_page,
        expected_args=["pid_value"],
        **{"icon": "list", "permissions": "can_read"},
    )
    communities.submenu("search").register(
        "invenio_app_rdm_communities.communities_detail",
        text=_("Records"),
        order=10,
        expected_args=["pid_value"],
        **dict(icon="search", permissions=True),
    )
    communities.submenu("submit").register(
        "invenio_app_rdm_communities.community_static_page",
        text=_("Submit"),
        order=15,
        visible_when=_is_branded_community,
        endpoint_arguments_constructor=lambda: {
            "pid_value": request.view_args["pid_value"],
            "page_slug": "how-to-submit",
        },
        **dict(icon="upload", permissions="can_read"),
    )
