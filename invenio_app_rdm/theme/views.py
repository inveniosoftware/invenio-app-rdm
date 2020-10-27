# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprint used for loading templates.

The sole purpose of this blueprint is to ensure that Invenio can find the
templates and static files located in the folders of the same names next to
this file.
"""

from flask import Blueprint, config, current_app, g, render_template
from flask_menu import current_menu
from invenio_rdm_records.resources import BibliographicDraftActionResource, \
    BibliographicDraftResource, BibliographicDraftResourceConfig, \
    BibliographicRecordResource, BibliographicUserRecordsResource
from invenio_rdm_records.services import BibliographicRecordService, \
    BibliographicRecordServiceConfig, BibliographicUserRecordsService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies


def ui_blueprint(app):
    """Dynamically registers routes (allows us to rely on config)."""
    blueprint = Blueprint(
        'invenio_app_rdm',
        __name__,
        template_folder='templates',
        static_folder='static',
    )

    service = BibliographicRecordService(
            config=BibliographicRecordServiceConfig())

    @blueprint.before_app_first_request
    def init_menu():
        """Initialize menu before first request."""
        item = current_menu.submenu('main.deposit')
        item.register(
            'invenio_app_rdm.deposits_user',
            'Uploads',
            order=1
        )

    search_url = app.config.get('RDM_RECORDS_UI_SEARCH_URL', '/search')

    @blueprint.route(search_url)
    def search():
        """Search page."""
        return render_template(current_app.config['SEARCH_BASE_TEMPLATE'])

    @blueprint.route(app.config.get('RDM_RECORDS_UI_NEW_URL', '/uploads/new'))
    def deposits_create():
        """Record creation page."""
        forms_config = dict(
            createUrl=("/api/records"),
            vocabularies=Vocabularies.dump(),
        )
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=dump_empty(RDMRecordSchema),
            searchbar_config=dict(searchUrl=search_url)
        )

    @blueprint.route(
        app.config.get('RDM_RECORDS_UI_EDIT_URL', '/uploads/<pid_value>')
    )
    def deposits_edit(pid_value):
        """Deposit edit page."""
        links_config = BibliographicDraftResourceConfig.links_config
        draft = service.read_draft(
            id_=pid_value, identity=g.identity, links_config=links_config)

        forms_config = dict(
            apiUrl=f"/api/records/{pid_value}/draft",
            vocabularies=Vocabularies.dump()
        )

        searchbar_config = dict(searchUrl=search_url)
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=draft.to_dict(),
            searchbar_config=searchbar_config
        )

    @blueprint.route(
        app.config.get('RDM_RECORDS_UI_SEARCH_USER_URL', '/uploads'))
    def deposits_user():
        """List of user deposits page."""
        return render_template(
            current_app.config['DEPOSITS_UPLOADS_TEMPLATE'],
            searchbar_config=dict(searchUrl=search_url)
        )

    return blueprint


#
# API Blueprints
#
def record_bp(app):
    """Callable record blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicRecordResource(
            service=BibliographicRecordService()
        ).as_blueprint("bibliographic_record_resource")


def draft_bp(app):
    """Callable draft blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicDraftResource(
            service=BibliographicRecordService()
        ).as_blueprint("bibliographic_draft_resource")


def draft_action_bp(app):
    """Callable draft action blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicDraftActionResource(
            service=BibliographicRecordService()
        ).as_blueprint("bibliographic_draft_action_resource")


def user_records_bp(app):
    """Callable user records blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicUserRecordsResource(
            service=BibliographicUserRecordsService()
        ).as_blueprint("bibliographic_user_records_resource")
