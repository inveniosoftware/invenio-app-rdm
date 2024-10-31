# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request views module."""

from flask import abort, g, redirect, request, url_for
from invenio_communities.views.communities import (
    HEADER_PERMISSIONS,
    _get_roles_can_invite,
    _get_roles_can_update,
    render_community_theme_template,
)
from invenio_communities.views.decorators import pass_community
from invenio_pages.proxies import current_pages_service
from invenio_pages.records.errors import PageNotFoundError
from invenio_rdm_records.collections import (
    CollectionNotFound,
    CollectionTreeNotFound,
    LogoNotFoundError,
)
from invenio_rdm_records.proxies import (
    current_community_records_service,
    current_rdm_records,
)
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_records_resources.services.errors import PermissionDeniedError


@pass_community(serialize=True)
def communities_detail(pid_value, community, community_ui):
    """Community detail page."""
    permissions = community.has_permissions_to(HEADER_PERMISSIONS)
    endpoint = "/api/communities/{pid_value}/records"

    return render_community_theme_template(
        "invenio_communities/records/index.html",
        theme=community_ui.get("theme", {}),
        community=community,
        community_ui=community_ui,
        # Pass permissions so we can disable partially UI components
        # e.g Settings tab
        permissions=permissions,
        active_community_header_menu_item="search",
        endpoint=endpoint.format(pid_value=community.to_dict()["id"]),
    )


@pass_community(serialize=True)
def communities_home(pid_value, community, community_ui):
    """Community home page."""
    query_params = request.args
    collections_service = current_rdm_records.collections_service
    permissions = community.has_permissions_to(HEADER_PERMISSIONS)
    if not permissions["can_read"]:
        raise PermissionDeniedError()

    theme_enabled = community._record.theme and community._record.theme.get(
        "enabled", False
    )

    if query_params or not theme_enabled:
        url = url_for(
            "invenio_app_rdm_communities.communities_detail",
            pid_value=community.data["slug"],
            **request.args,
        )
        return redirect(url)

    if theme_enabled:
        recent_uploads = current_community_records_service.search(
            community_id=pid_value,
            identity=g.identity,
            params={
                "sort": "newest",
                "size": 3,
                "metrics": {
                    "total_grants": {
                        "name": "total_grants",
                        "type": "cardinality",
                        "kwargs": {"field": "metadata.funding.award.id"},
                    },
                    "total_data": {
                        "name": "total_data",
                        "type": "sum",
                        "kwargs": {"field": "files.totalbytes"},
                    },
                },
            },
            expand=True,
        )

        collections = collections_service.list_trees(g.identity, community.id, depth=0)

        # TODO resultitem does not expose aggregations except labelled facets
        _metric_aggs = recent_uploads._results.aggregations
        metrics = {
            "total_records": recent_uploads.total,
            "total_data": _metric_aggs.total_data.value,
            "total_grants": _metric_aggs.total_grants.value,
        }

        records_ui = UIJSONSerializer().dump_list(recent_uploads.to_dict())["hits"][
            "hits"
        ]

        return render_community_theme_template(
            "invenio_communities/details/home/index.html",
            theme=community_ui.get("theme", {}),
            community=community_ui,
            permissions=permissions,
            records=records_ui,
            metrics=metrics,
            collections=collections.to_dict(),
        )


@pass_community(serialize=True)
def communities_browse(pid_value, community, community_ui):
    """Community browse page."""
    permissions = community.has_permissions_to(HEADER_PERMISSIONS)

    collections_service = current_rdm_records.collections_service

    trees_ui = collections_service.list_trees(
        g.identity, community_id=community.id, depth=2
    ).to_dict()
    return render_community_theme_template(
        "invenio_communities/details/browse/index.html",
        theme=community_ui.get("theme", {}),
        community=community_ui,
        permissions=permissions,
        roles_can_update=_get_roles_can_update(community.id),
        roles_can_invite=_get_roles_can_invite(community.id),
        trees=trees_ui,
    )


@pass_community(serialize=True)
def community_static_page(pid_value, community, community_ui, **kwargs):
    """Community static page."""
    permissions = community.has_permissions_to(HEADER_PERMISSIONS)
    if not permissions["can_read"]:
        raise PermissionDeniedError()

    try:
        page = current_pages_service.read_by_url(g.identity, request.path).to_dict()

    except PageNotFoundError:
        abort(404)

    return render_community_theme_template(
        page["template_name"],
        theme=community_ui.get("theme", {}),
        page=page,
        community=community_ui,
        permissions=permissions,
    )


@pass_community(serialize=True)
def community_collection(
    community, community_ui, pid_value, tree_slug=None, collection_slug=None
):
    """Render a community collection page."""
    collections_service = current_rdm_records.collections_service
    try:
        collection = collections_service.read(
            identity=g.identity,
            community_id=community.id,
            slug=collection_slug,
            tree_slug=tree_slug,
        )
    except (CollectionNotFound, CollectionTreeNotFound):
        abort(404)

    try:
        logo = collections_service.read_logo(g.identity, collection_slug)
    except LogoNotFoundError:
        logo = None

    collection_ui = collection.to_dict()
    return render_community_theme_template(
        "invenio_communities/collections/collection.html",
        collection=collection_ui,
        # TODO _collection should not be accessed from here
        tree=collection._collection.collection_tree,
        logo=logo,
        community=community,
        permissions=community.has_permissions_to(HEADER_PERMISSIONS),
        theme=community_ui.get("theme", {}),
    )
