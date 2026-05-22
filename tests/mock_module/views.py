# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT

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
