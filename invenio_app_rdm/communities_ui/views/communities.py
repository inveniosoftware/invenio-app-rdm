# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request views module."""

from invenio_communities.views.communities import render_community_theme_template
from invenio_communities.views.decorators import pass_community


@pass_community(serialize=True)
def communities_detail(pid_value, community, community_ui):
    """Community detail page."""
    permissions = community.has_permissions_to(
        ["update", "read", "search_requests", "search_invites", "moderate"]
    )
    endpoint = "/api/communities/{pid_value}/records"

    return render_community_theme_template(
        "invenio_communities/details/index.html",
        theme_brand=community_ui.get("theme", {}).get("brand"),
        community=community,
        community_ui=community_ui,
        # Pass permissions so we can disable partially UI components
        # e.g Settings tab
        permissions=permissions,
        active_community_header_menu_item="search",
        endpoint=endpoint.format(pid_value=community.to_dict()["id"]),
    )
