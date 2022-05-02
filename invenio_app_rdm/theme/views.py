# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for general pages provided by Invenio-App-RDM."""

from flask import Blueprint, current_app, render_template
from flask_babelex import get_locale
from flask_babelex import lazy_gettext as _
from flask_menu import current_menu


#
# Registration
#
def create_blueprint(app):
    """Blueprint for the routes and resources provided by Invenio-App-RDM."""
    routes = app.config.get("APP_RDM_ROUTES")

    blueprint = Blueprint(
        "invenio_app_rdm",
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    blueprint.add_url_rule(routes["index"], view_func=index)
    blueprint.add_url_rule(routes["help_search"], view_func=help_search)

    @blueprint.before_app_first_request
    def init_menu():
        """Initialize menu before first request."""
        current_menu.submenu('actions.deposit').register(
            'invenio_app_rdm_users.uploads',
            _('My dashboard'),
            order=1
        )

        current_menu.submenu('plus.deposit').register(
            'invenio_app_rdm_records.deposit_create',
            _('New upload'),
            order=1,
        )

        current_menu.submenu("notifications.requests").register(
            "invenio_app_rdm_users.requests",
            order=1,
        )

    return blueprint


#
# Views
#
def index():
    """Frontpage."""
    return render_template(
        current_app.config['THEME_FRONTPAGE_TEMPLATE'],
    )


def help_search():
    """Search help guide."""
    # Default to rendering english page if locale page not found.
    locale = get_locale()
    return render_template([
        f"invenio_app_rdm/help/search.{locale}.html",
        "invenio_app_rdm/help/search.en.html",
    ])
