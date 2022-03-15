# -*- coding: utf-8 -*-
#
# Copyright (C) 2018-2021 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Configuration helper for React-SearchKit."""

from functools import partial

from flask import current_app
from invenio_search_ui.searchconfig import search_app_config


def search_app_context():
    """Search app context processor."""
    return {
        'search_app_rdm_config': partial(
            search_app_config,
            'RDM_SEARCH',
            current_app.config['RDM_FACETS'],
            current_app.config['RDM_SORT_OPTIONS'],
            '/api/records',
            {"Accept": "application/vnd.inveniordm.v1+json"}
        ),
        'search_app_rdm_user_uploads_config': partial(
            search_app_config,
            'RDM_SEARCH_DRAFTS',
            current_app.config['RDM_FACETS'],
            current_app.config['RDM_SORT_OPTIONS'],
            '/api/user/records',
            {"Accept": "application/vnd.inveniordm.v1+json"},
        ),
        'search_app_rdm_user_communities_config': partial(
            search_app_config,
            'RDM_SEARCH_USER_COMMUNITIES',
            current_app.config['COMMUNITIES_FACETS'],
            current_app.config['RDM_SORT_OPTIONS'],
            '/api/user/communities',
            {"Accept": "application/json"}
        ),
        'search_app_rdm_user_requests_config': partial(
            search_app_config,
            'RDM_SEARCH_USER_REQUESTS',
            current_app.config['REQUESTS_FACETS'],
            current_app.config['RDM_SORT_OPTIONS'],
            '/api/requests',
            {"Accept": "application/json"},
            initial_filters=[["is_open", "true"]]
        )
    }
