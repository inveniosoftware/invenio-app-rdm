# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
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
