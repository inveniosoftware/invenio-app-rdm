# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Communities UI blueprints module."""

from flask import Blueprint, current_app, render_template
from flask_babelex import lazy_gettext as _
from flask_login import current_user
from flask_menu import current_menu
from invenio_pidstore.errors import PIDDeletedError, PIDDoesNotExistError
from invenio_records_resources.services.errors import PermissionDeniedError

from invenio_app_rdm.communities_ui.views.communities import communities_detail

from ..searchapp import search_app_context


#
# Error handlers
#
def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config["THEME_404_TEMPLATE"]), 404


def record_tombstone_error(error):
    """Tombstone page."""
    return render_template("invenio_communities/tombstone.html"), 410


def record_permission_denied_error(error):
    """Handle permission denier error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()
    return render_template(current_app.config["THEME_403_TEMPLATE"]), 403


def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config["RDM_COMMUNITIES_ROUTES"]

    blueprint = Blueprint(
        "invenio_app_rdm_communities",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    blueprint.add_url_rule(
        routes["community-detail"],
        view_func=communities_detail,
    )

    @blueprint.before_app_first_request
    def register_menus():
        """Register community menu items."""
        communities = current_menu.submenu("communities")
        communities.submenu("search").register(
            "invenio_app_rdm_communities.communities_detail",
            text=_("Search"),
            order=1,
            expected_args=["pid_value"],
            **dict(icon="search", permissions=True)
        )

    # Register error handlers
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error
    )
    blueprint.register_error_handler(PIDDeletedError, record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)

    # Register context processor
    blueprint.app_context_processor(search_app_context)

    return blueprint
