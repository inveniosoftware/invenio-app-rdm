# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request views module."""

from flask import render_template
from flask_babelex import lazy_gettext as _
from invenio_communities.views.decorators import pass_community, \
    pass_community_logo


@pass_community
@pass_community_logo
def communities_detail(community=None, logo=None, pid_value=None):
    """Community detail page."""
    permissions = community.has_permissions_to(
        ['update', 'read', 'search_requests', 'search_invites']
    )
    endpoint = '/api/communities/{pid_value}/records'

    return render_template(
        "invenio_communities/details/index.html",
        community=community.to_dict(),  # TODO: use serializer
        logo=logo.to_dict() if logo else None,
        # Pass permissions so we can disable partially UI components
        # e.g Settings tab
        permissions=permissions,
        active_community_header_menu_item="search",
        endpoint=endpoint.format(pid_value=community.to_dict()["id"])
    )