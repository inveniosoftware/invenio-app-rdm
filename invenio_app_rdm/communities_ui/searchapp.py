# SPDX-FileCopyrightText: 2018-2021 CERN.
# SPDX-License-Identifier: MIT

"""Configuration helper for React-SearchKit."""

from functools import partial

from flask import current_app
from invenio_search_ui.searchconfig import search_app_config


def search_app_context():
    """Search app context processor."""
    return {
        "search_app_communities_records_config": partial(
            search_app_config,
            config_name="COMMUNITIES_RECORDS_SEARCH",
            available_facets=current_app.config["RDM_FACETS"],
            sort_options=current_app.config["RDM_SORT_OPTIONS"],
            headers={"Accept": "application/vnd.inveniordm.v1+json"},
            pagination_options=(10, 20),
        ),
    }
