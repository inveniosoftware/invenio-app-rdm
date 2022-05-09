# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request UI blueprints module."""

from flask import Blueprint
from invenio_pidstore.errors import PIDDeletedError, PIDDoesNotExistError
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.views.ui import not_found_error, \
    record_permission_denied_error, record_tombstone_error

from invenio_app_rdm.requests_ui.views.requests import \
    community_dashboard_request_view, user_dashboard_request_view


def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config["RDM_REQUESTS_ROUTES"]

    blueprint = Blueprint(
        "invenio_app_rdm_requests",
        __name__,
        template_folder="../templates",
        static_folder='../static'
    )

    blueprint.add_url_rule(
        routes["user-dashboard-request-details"],
        view_func=user_dashboard_request_view,
    )

    blueprint.add_url_rule(
        routes["community-dashboard-request-details"],
        view_func=community_dashboard_request_view,
    )

    blueprint.add_url_rule(
        routes['community-dashboard-invitation-details'],
        view_func=community_dashboard_request_view,
    )

    # Register error handlers
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error)
    blueprint.register_error_handler(PIDDeletedError,
                                     record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)

    return blueprint
