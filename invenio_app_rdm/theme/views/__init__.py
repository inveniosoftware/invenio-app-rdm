# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprints and views for Invenio-App-RDM."""

from flask import Blueprint
from flask_menu import current_menu

from .deposits import register_deposits_ui_routes
from .filters import register_filters
from .general import register_general_ui_routes
from .records import file_download_ui, register_records_ui_routes


def ui_blueprint(app):
    """Blueprint for the routes and resources provided by Invenio-App-RDM."""
    blueprint = Blueprint(
        "invenio_app_rdm",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    register_filters(blueprint)
    register_general_ui_routes(app, blueprint)
    register_records_ui_routes(app, blueprint)
    register_deposits_ui_routes(app, blueprint)

    @blueprint.before_app_first_request
    def init_menu():
        """Initialize menu before first request."""
        item = current_menu.submenu("main.deposit")
        item.register("invenio_app_rdm.deposits_user", "Uploads", order=1)

    return blueprint


__all__ = ("file_download_ui", "ui_blueprint")
