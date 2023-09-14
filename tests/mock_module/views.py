# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Mock module blueprint."""

from flask import Blueprint


def create_blueprint(app):
    """Creates a blueprint for mock module and registers a mock url rule."""
    blueprint = Blueprint(
        "app_rdm_mock_module",
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    blueprint.add_url_rule(
        "/test_app_rdm/mock",
        endpoint="test_app_rdm_mock_endpoint",
        view_func=mock_view_func,
    )

    return blueprint


def mock_view_func(mock_arg):
    """Mock view function."""
    return mock_arg
