# SPDX-FileCopyrightText: 2023-2024 CERN.
# SPDX-License-Identifier: MIT
"""Administration ui views module."""

from flask import Blueprint


def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    blueprint = Blueprint(
        "invenio_app_rdm_administration",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    return blueprint
