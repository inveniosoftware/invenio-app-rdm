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
from invenio_rdm_records.access_requests_ui.views import (
    read_request,
    verify_access_request_token,
)
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.views.ui import (
    not_found_error,
    record_permission_denied_error,
    record_tombstone_error,
)
from sqlalchemy.exc import NoResultFound

from ...records_ui.searchapp import search_app_context
from .requests import community_dashboard_request_view, user_dashboard_request_view


def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config["RDM_REQUESTS_ROUTES"]

    blueprint = Blueprint(
        "invenio_app_rdm_requests",
        __name__,
        template_folder="../templates",
        static_folder="../static",
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
        routes["community-dashboard-invitation-details"],
        view_func=community_dashboard_request_view,
    )

    blueprint.add_url_rule(
        "/access/requests/confirm", view_func=verify_access_request_token
    )
    blueprint.add_url_rule(
        "/access/requests/<request_pid_value>", view_func=read_request
    )

    # Register error handlers
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error
    )
    blueprint.register_error_handler(PIDDeletedError, record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)
    # due to requests found by ID, not PID (check service read method)
    blueprint.register_error_handler(NoResultFound, not_found_error)
    blueprint.app_context_processor(search_app_context)

    return blueprint
