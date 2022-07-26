# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2022 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Admin UI views."""

from flask import Blueprint, current_app, render_template, request
from flask_login import current_user
from flask_menu import current_menu

#
# Error handlers
#
from invenio_app_rdm.admin_ui.views.admin import admin, oai_pmh, featured


def not_found_error(error):
    """Handler for 'Not Found' errors."""
    return render_template(current_app.config["THEME_404_TEMPLATE"]), 404


def record_permission_denied_error(error):
    """Handle permission denier error on record views."""
    if not current_user.is_authenticated:
        # trigger the flask-login unauthorized handler
        return current_app.login_manager.unauthorized()
    return render_template(current_app.config["THEME_403_TEMPLATE"]), 403


def active_when(self):
    return request.endpoint == self._endpoint


#
# Registration
#
def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config.get("APP_RDM_USER_DASHBOARD_ROUTES")

    blueprint = Blueprint(
        "invenio_app_rdm_admin",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    blueprint.add_url_rule("/test_admin", view_func=admin)
    blueprint.add_url_rule("/test_admin/oai-pmh", view_func=oai_pmh)
    blueprint.add_url_rule("/test_admin/featured-communities", view_func=featured)

    menu_entry1 = {
        "text": "Dashboard",
        "order": 1,
        "endpoint": "invenio_app_rdm_admin.admin",
    }

    menu_entry2 = {
        "text": "OAI-PMH",
        "category": "Export",
        "order": 2,
        "endpoint": "invenio_app_rdm_admin.oai_pmh"
    }

    menu_entry3 = {
        "text": "Featured",
        "category": "Communities",
        "order": 2,
        "endpoint": "invenio_app_rdm_admin.featured"
    }

    menu_entry4 = {
        "text": "All",
        "category": "Communities",
        "order": 1,
        "endpoint": "invenio_app_rdm_admin.admin"
    }

    menus = [menu_entry1, menu_entry2, menu_entry3, menu_entry4]

    @blueprint.before_app_first_request
    def register_menus():
        """Register admin menu items."""
        backoffice_menu = current_menu.submenu("backoffice_navigation")

        for menu_entry in menus:
            category = menu_entry.get('category')
            text = menu_entry.get('text')
            endpoint = menu_entry.get('endpoint')
            order = menu_entry.get('order')

            if category:
                category_menu = backoffice_menu.submenu(category)
                category_menu.register(text=category)
                category_menu.submenu(text).register(
                    endpoint=endpoint,
                    text=text,
                    order=order,
                    active_when=active_when
                )
            else:
                backoffice_menu.submenu(text).register(
                    endpoint=endpoint,
                    text=text,
                    order=order,
                    active_when=active_when
                )

    return blueprint
