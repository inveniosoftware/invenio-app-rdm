# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
# Copyright (C) 2023-2024 Graz University of Technology.
# Copyright (C)      2024 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for general pages provided by Invenio-App-RDM."""

from flask import Blueprint, current_app, flash, render_template, request
from flask_login import current_user
from invenio_db import db
from invenio_i18n import get_locale
from invenio_i18n import lazy_gettext as _
from invenio_pages.views import create_page_view
from invenio_users_resources.forms import NotificationsForm


def create_url_rule(rule, default_view_func):
    """Generate rule from string or tuple."""
    if isinstance(rule, tuple):
        path, view_func = rule

        return {"rule": path, "view_func": view_func}
    else:
        return {"rule": rule, "view_func": default_view_func}


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

    blueprint.add_url_rule(**create_url_rule(routes["index"], default_view_func=index))
    blueprint.add_url_rule(
        **create_url_rule(routes["robots"], default_view_func=robots)
    )
    blueprint.add_url_rule(
        **create_url_rule(routes["help_search"], default_view_func=help_search)
    )
    blueprint.add_url_rule(
        **create_url_rule(routes["help_statistics"], default_view_func=help_statistics)
    )
    blueprint.add_url_rule(
        **create_url_rule(routes["help_versioning"], default_view_func=help_versioning)
    )
    add_static_page_routes(blueprint, app)

    return blueprint


#
# Views
#
def index():
    """Frontpage."""
    return render_template(
        current_app.config["THEME_FRONTPAGE_TEMPLATE"],
        show_intro_section=current_app.config["THEME_SHOW_FRONTPAGE_INTRO_SECTION"],
    )


def robots():
    """Robots.txt."""
    return current_app.send_static_file("robots.txt")


def help_search():
    """Search help guide."""
    # Default to rendering english page if locale page not found.
    locale = get_locale()
    return render_template(
        [
            f"invenio_app_rdm/help/search.{locale}.html",
            "invenio_app_rdm/help/search.en.html",
        ]
    )


def help_statistics():
    """Statistics help guide."""
    # Default to rendering english page if locale page not found.
    locale = get_locale()
    return render_template(
        [
            f"invenio_app_rdm/help/statistics.{locale}.html",
            "invenio_app_rdm/help/statistics.en.html",
        ]
    )


def help_versioning():
    """DOI versioning help guide."""
    # Default to rendering english page if locale page not found.
    locale = get_locale()
    return render_template(
        [
            f"invenio_app_rdm/help/versioning.{locale}.html",
            "invenio_app_rdm/help/versioning.en.html",
        ]
    )


def notification_settings():
    """View for notification settings."""
    preferences_notifications_form = NotificationsForm(
        formdata=None, obj=current_user, prefix="preferences-notifications"
    )

    # Pick form
    form_name = request.form.get("submit", None)
    form = preferences_notifications_form if form_name else None

    # Process form
    if form:
        form.process(formdata=request.form)
        if form.validate_on_submit():
            handle_notifications_form(form)
            flash(_("Notification preferences were updated."), category="success")

    return render_template(
        "invenio_app_rdm/settings/notifications.html",
        preferences_notifications_form=preferences_notifications_form,
    )


def handle_notifications_form(form):
    """Handle notification preferences form."""
    form.populate_obj(current_user)
    db.session.add(current_user)
    current_app.extensions["security"].datastore.commit()


def add_static_page_routes(blueprint, app):
    """Add custom page routes to the blueprint from the app configuration."""
    for endpoint, path in app.config["APP_RDM_PAGES"].items():
        blueprint.add_url_rule(
            path, endpoint=endpoint, view_func=create_page_view(path)
        )
