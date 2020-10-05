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

from flask import Blueprint, current_app, render_template
from flask_menu import current_menu
from invenio_rdm_records.marshmallow.json import MetadataSchemaV1, dump_empty
from invenio_rdm_records.resources import BibliographicDraftActionResource, \
    BibliographicDraftActionResourceConfig, BibliographicDraftResource, \
    BibliographicDraftResourceConfig, BibliographicRecordResource, \
    BibliographicRecordResourceConfig
from invenio_rdm_records.services import BibliographicRecordService, \
    BibliographicRecordServiceConfig
from invenio_rdm_records.vocabularies import Vocabularies


def ui_blueprint(app):
    """Dynamically registers routes (allows us to rely on config)."""
    blueprint = Blueprint(
        'invenio_app_rdm',
        __name__,
        template_folder='templates',
        static_folder='static',
    )

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
            # api_route(BibliographicRecordResource().config.list_route)
            createUrl=(""),
            vocabularies=Vocabularies.dump(),
        )
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=dump_empty(MetadataSchemaV1),
            searchbar_config=dict(searchUrl=search_url)
        )

    @blueprint.route(
        app.config.get('RDM_RECORDS_UI_EDIT_URL', '/uploads/<pid_value>')
    )
    def deposits_edit(pid_value):
        """Fake deposits edit page."""
        forms_config = dict(
            apiUrl='/api/records/',
            vocabularies=Vocabularies.dump()
        )
        # minimal record
        record = {
            "_access": {
                "metadata_restricted": False,
                "files_restricted": False
            },
            "_owners": [1],
            "_created_by": 1,
            "access_right": "open",
            "id": f"{pid_value}",
            "resource_type": {
                "type": "image",
                "subtype": "image-photo"
            }
        }
        searchbar_config = dict(searchUrl=search_url)

        initial_record = dump_empty(MetadataSchemaV1)
        initial_record.update(record)
        return render_template(
            current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
            forms_config=forms_config,
            record=initial_record,
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
            config=BibliographicRecordResourceConfig(),
            service=BibliographicRecordService(
                config=BibliographicRecordServiceConfig()
            )
        ).as_blueprint("bibliographic_record_resource")


def draft_bp(app):
    """Callable draft blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicDraftResource(
            config=BibliographicDraftResourceConfig(),
            service=BibliographicRecordService(
                config=BibliographicRecordServiceConfig()
            )
        ).as_blueprint("bibliographic_draft_resource")


def draft_action_bp(app):
    """Callable draft action blueprint (we need an application context)."""
    with app.app_context():
        return BibliographicDraftActionResource(
            config=BibliographicDraftActionResourceConfig(),
            service=BibliographicRecordService(
                config=BibliographicRecordServiceConfig()
            )
        ).as_blueprint("bibliographic_draft_action_resource")
