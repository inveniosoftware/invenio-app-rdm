# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
# Copyright (C) 2023-2024 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Communities UI blueprints module."""

from flask import Blueprint, current_app, g, request
from invenio_collections.proxies import current_collections
from invenio_collections.searchapp import search_app_context as c_search_app_context
from invenio_communities.errors import CommunityDeletedError
from invenio_communities.views.ui import (
    not_found_error,
    record_permission_denied_error,
    record_tombstone_error,
)
from invenio_pidstore.errors import PIDDeletedError, PIDDoesNotExistError
from invenio_records_resources.services.errors import (
    PermissionDeniedError,
    RecordPermissionDeniedError,
)

from invenio_app_rdm.views import create_url_rule

from ..searchapp import search_app_context
from .communities import (
    communities_browse,
    communities_detail,
    communities_home,
    community_collection,
    community_static_page,
)


def _show_browse_page():
    """Whether the browse page should be visible in the menu."""
    feature_enabled = current_app.config.get("COMMUNITIES_SHOW_BROWSE_MENU_ENTRY", False)
    if not feature_enabled:
        return False

    community = getattr(request, "community", None)
    if not community:
        return False

    subcommunities_enabled = community.get("children", {}).get("allow", False)

    has_collections = False
    try:
        collections_service = current_collections.service
        community_id = community.get("id")
        if community_id:
            trees = collections_service.list_trees(g.identity, community_id=community_id, depth=0)
            has_collections = len(trees.to_dict()) > 0
    except Exception:
        has_collections = False

    return subcommunities_enabled or has_collections


def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config["RDM_COMMUNITIES_ROUTES"]

    blueprint = Blueprint(
        "invenio_app_rdm_communities",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    blueprint.add_url_rule(
        **create_url_rule(routes["community-detail"], communities_detail),
        strict_slashes=False,
    )

    blueprint.add_url_rule(
        **create_url_rule(routes["community-home"], communities_home)
    )

    blueprint.add_url_rule(
        **create_url_rule(routes["community-browse"], communities_browse)
    )

    blueprint.add_url_rule(
        **create_url_rule(routes["community-static-page"], community_static_page)
    )

    blueprint.add_url_rule(
        **create_url_rule(routes["community-collection"], community_collection)
    )
    # Register error handlers
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error
    )
    blueprint.register_error_handler(
        RecordPermissionDeniedError, record_permission_denied_error
    )
    blueprint.register_error_handler(PIDDeletedError, record_tombstone_error)
    blueprint.register_error_handler(CommunityDeletedError, record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)

    # Register context processor
    blueprint.app_context_processor(search_app_context)
    blueprint.app_context_processor(c_search_app_context)

    return blueprint
