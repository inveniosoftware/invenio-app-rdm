# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Mock module views."""

from flask import Blueprint


def create_blueprint(app):
    """Blueprint for the routes and resources provided by Invenio-App-RDM."""
    blueprint = Blueprint(
        "mock_module",
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    return blueprint
