# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2021 CERN.
# Copyright (C) 2023-2024 Graz University of Technology.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Communities UI views."""

from flask import Blueprint, current_app, render_template
from flask_login import current_user

from ..searchapp import search_app_context
from .dashboard import communities, requests, uploads


#
# Error handlers
#
def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config["THEME_404_TEMPLATE"]), 404


def record_permission_denied_error(error):
    """Handle permission denier error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()
    return render_template(current_app.config["THEME_403_TEMPLATE"]), 403


#
# Registration
#
def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config.get("APP_RDM_USER_DASHBOARD_ROUTES")

    blueprint = Blueprint(
        "invenio_app_rdm_users",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    blueprint.add_url_rule(
        routes["uploads"],
        view_func=uploads,
    )

    # Settings tab routes
    blueprint.add_url_rule(
        routes["communities"],
        view_func=communities,
    )

    blueprint.add_url_rule(
        routes["requests"],
        view_func=requests,
    )

    # Register context processor
    blueprint.app_context_processor(search_app_context)

    return blueprint
