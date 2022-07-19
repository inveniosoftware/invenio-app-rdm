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
        "search_app_rdm_config": partial(
            search_app_config,
            "RDM_SEARCH",
            current_app.config["RDM_FACETS"],
            current_app.config["RDM_SORT_OPTIONS"],
            "/api/records",
            {"Accept": "application/vnd.inveniordm.v1+json"},
        ),
    }
