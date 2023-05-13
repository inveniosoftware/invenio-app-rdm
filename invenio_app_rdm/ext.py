# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio Research Data Management."""

from invenio_i18n import lazy_gettext as _


def finalize_app(app):
    """Finalize app."""
    init_menu(app)


def init_menu(app):
    """Init menu."""
    menu = app.extensions["menu"]

    menu.submenu("actions.deposit").register(
        endpoint="invenio_app_rdm_users.uploads",
        text=_("My dashboard"),
        order=1,
    )

    menu.submenu("plus.deposit").register(
        endpoint="invenio_app_rdm_records.deposit_create",
        text=_("New upload"),
        order=1,
    )

    menu.submenu("notifications.requests").register(
        "invenio_app_rdm_users.requests",
        order=1,
    )

    user_dashboard = menu.submenu("dashboard")
    user_dashboard.submenu("uploads").register(
        endpoint="invenio_app_rdm_users.uploads",
        text=_("Uploads"),
        order=1,
    )
    user_dashboard.submenu("communities").register(
        endpoint="invenio_app_rdm_users.communities",
        text=_("Communities"),
        order=2,
    )
    user_dashboard.submenu("requests").register(
        endpoint="invenio_app_rdm_users.requests",
        text=_("Requests"),
        order=3,
    )

    communities = menu.submenu("communities")
    communities.submenu("search").register(
        endpoint="invenio_app_rdm_communities.communities_detail",
        text=_("Search"),
        order=1,
        expected_args=["pid_value"],
        **dict(icon="search", permissions=True)
    )
