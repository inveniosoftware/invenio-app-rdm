# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprint for general pages provided by Invenio-App-RDM."""

from flask import Blueprint, current_app, render_template


def ui_blueprint(app):
    """Dynamically registers routes (allows us to rely on config)."""
    blueprint = Blueprint(
        "invenio_app_rdm_theme",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    @blueprint.route(app.config.get("RDM_RECORDS_UI_SEARCH_URL", "/search"))
    def search():
        """Search page."""
        return render_template(current_app.config["SEARCH_BASE_TEMPLATE"])

    @blueprint.route("/coming-soon")
    def coming_soon():
        """Route to display on soon-to-come features."""
        return render_template("invenio_app_rdm/coming_soon_page.html")

    @blueprint.route("/help/search")
    def help_search():
        """Search help guide."""
        return render_template("invenio_app_rdm/help/search.html")

    return blueprint
