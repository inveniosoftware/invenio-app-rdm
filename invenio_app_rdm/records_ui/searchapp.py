# -*- coding: utf-8 -*-
#
# Copyright (C) 2018-2021 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Configuration helper for React-SearchKit."""

from functools import partial

from flask import current_app
from invenio_rdm_records.requests import CommunityInclusion, CommunitySubmission
from invenio_search_ui.searchconfig import search_app_config


def search_app_context():
    """Search app context processor."""
    return {
        "search_app_rdm_config": partial(
            search_app_config,
            "RDM_SEARCH",
            current_app.config["RDM_FACETS"],
            current_app.config["RDM_SORT_OPTIONS"],
            "/api/records",
            {"Accept": "application/vnd.inveniordm.v1+json"},
            pagination_options=(10, 20),
        ),
        "search_app_rdm_record_requests_config": partial(
            search_app_config,
            config_name="RDM_SEARCH_USER_REQUESTS",
            available_facets=current_app.config["REQUESTS_FACETS"],
            sort_options=current_app.config["RDM_SORT_OPTIONS"],
            headers={"Accept": "application/json"},
            hidden_params=[
                ["expand", "1"],
                ["is_open", "true"],
                ["type", CommunityInclusion.type_id],
                ["type", CommunitySubmission.type_id],
            ],
            page=1,
            size=5,
        ),
        "search_app_rdm_record_communities_config": partial(
            search_app_config,
            config_name="RDM_SEARCH_USER_COMMUNITIES",
            available_facets=current_app.config["COMMUNITIES_FACETS"],
            sort_options=current_app.config["RDM_SORT_OPTIONS"],
            headers={"Accept": "application/vnd.inveniordm.v1+json"},
            pagination_options=(10, 20),
        ),
        "search_app_rdm_record_user_communities_config": partial(
            search_app_config,
            config_name="RDM_SEARCH_USER_COMMUNITIES",
            available_facets=current_app.config["COMMUNITIES_FACETS"],
            sort_options=current_app.config["RDM_SORT_OPTIONS"],
            headers={"Accept": "application/vnd.inveniordm.v1+json"},
            hidden_params=[
                ["membership", "true"],
            ],
            pagination_options=(10, 20),
        ),
        "search_app_access_links_config": partial(
            search_app_config,
            config_name="RDM_SEARCH",
            available_facets=current_app.config["RDM_FACETS"],
            sort_options=current_app.config["RDM_SORT_OPTIONS"],
            headers={"Accept": "application/json"},
        ),
    }
