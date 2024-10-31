# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
# Copyright (C) 2023-2024 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Communities UI blueprints module."""

from flask import Blueprint, current_app, render_template, request
from flask_login import current_user
from invenio_communities.communities.resources.serializer import (
    UICommunityJSONSerializer,
)
from invenio_communities.errors import CommunityDeletedError
from invenio_i18n import lazy_gettext as _
from invenio_pidstore.errors import PIDDeletedError, PIDDoesNotExistError
from invenio_rdm_records.collections import search_app_context as c_search_app_context
from invenio_records_resources.services.errors import PermissionDeniedError

from ..searchapp import search_app_context
from .communities import (
    communities_browse,
    communities_detail,
    communities_home,
    community_collection,
    community_static_page,
)


#
# Error handlers
#
def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config["THEME_404_TEMPLATE"]), 404


def record_tombstone_error(error):
    """Tombstone page."""
    # the RecordDeletedError will have the following properties,
    # while the PIDDeletedError won't
    record = getattr(error, "record", None)
    if (record_ui := getattr(error, "result_item", None)) is not None:
        if record is None:
            record = record_ui._record
        record_ui = UICommunityJSONSerializer().dump_obj(record_ui.to_dict())

    # render a 404 page if the tombstone isn't visible
    if not record.tombstone.is_visible:
        return not_found_error(error)

    # we only render a tombstone page if there is a record with a visible tombstone
    return (
        render_template(
            "invenio_communities/tombstone.html",
            record=record_ui,
        ),
        410,
    )


def record_permission_denied_error(error):
    """Handle permission denier error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()
    return render_template(current_app.config["THEME_403_TEMPLATE"]), 403


def _show_browse_page():
    """Whether the browse page should be visible in the menu."""
    return (
        current_app.config.get("COMMUNITIES_SHOW_BROWSE_MENU_ENTRY", False)
        and request.community["children"]["allow"]
    )


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
        strict_slashes=False,
    )

    blueprint.add_url_rule(
        routes["community-home"],
        view_func=communities_home,
    )

    blueprint.add_url_rule(
        routes["community-browse"],
        view_func=communities_browse,
    )

    blueprint.add_url_rule(
        routes["community-static-page"],
        view_func=community_static_page,
    )

    blueprint.add_url_rule(
        routes["community-collection"],
        view_func=community_collection,
    )
    # Register error handlers
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error
    )
    blueprint.register_error_handler(PIDDeletedError, record_tombstone_error)
    blueprint.register_error_handler(CommunityDeletedError, record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)

    # Register context processor
    blueprint.app_context_processor(search_app_context)
    blueprint.app_context_processor(c_search_app_context)

    return blueprint
