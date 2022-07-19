# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
# Copyright (C) 2022 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDM User dashboard views."""

from flask import render_template
from flask_login import current_user, login_required
from invenio_users_resources.proxies import current_user_resources

from invenio_app_rdm.records_ui.views.deposits import get_search_url


@login_required
def uploads():
    """Display user dashboard page."""
    url = current_user_resources.users_service.links_item_tpl.expand(current_user)[
        "avatar"
    ]
    return render_template(
        "invenio_app_rdm/users/uploads.html",
        searchbar_config=dict(searchUrl=get_search_url()),
        user_avatar=url,
    )


@login_required
def requests():
    """Display user dashboard page."""
    url = current_user_resources.users_service.links_item_tpl.expand(current_user)[
        "avatar"
    ]
    return render_template(
        "invenio_app_rdm/users/requests.html",
        searchbar_config=dict(searchUrl=get_search_url()),
        user_avatar=url,
    )


@login_required
def communities():
    """Display user dashboard page."""
    url = current_user_resources.users_service.links_item_tpl.expand(current_user)[
        "avatar"
    ]
    return render_template(
        "invenio_app_rdm/users/communities.html",
        searchbar_config=dict(searchUrl=get_search_url()),
        user_avatar=url,
    )
