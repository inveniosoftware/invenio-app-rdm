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

from __future__ import absolute_import, print_function

from flask import Blueprint, current_app, render_template

blueprint = Blueprint(
    'invenio_app_rdm',
    __name__,
    template_folder='templates',
    static_folder='static',
)


@blueprint.route('/search')
def search():
    """Search page."""
    return render_template(current_app.config['SEARCH_BASE_TEMPLATE'])


@blueprint.route('/records/new')
def records_create():
    """Record creation page."""
    config = dict(apiUrl='/api/records/')
    return render_template(
        current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
        ui_config=config
    )


@blueprint.route('/records/fake/<string:id>/edit')
def records_fake_edit(id):
    """Fake record edit page."""
    config = dict(apiUrl='/api/records/')
    # minimal record
    record = {
        "_access": {
            "metadata_restricted": False,
            "files_restricted": False
        },
        "_owners": [1],
        "_created_by": 1,
        "access_right": "open",
        "resource_type": {
            "type": "image",
            "subtype": "image-photo"
        },
        # Technically not required
        "creators": [],
        "titles": [{
            "title": "A Romans story",
            "type": "Other",
            "lang": "eng"
        }]
    }
    return render_template(
        current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
        ui_config=config,
        record=record)


@blueprint.route('/drafts/<string:id>/edit')
def drafts_edit(id):
    """Drafts edit page."""
    from invenio_pidstore.resolver import Resolver
    from invenio_records.api import Record

    resolver = Resolver(
        pid_type='recid', object_type="rec", getter=Record.get_record
    )
    _, record = resolver.resolve(str(id))
    config = dict(apiUrl='/api/records/')
    return render_template(
        current_app.config['DRAFTS_FORMS_BASE_TEMPLATE'],
        ui_config=config,
        record=record)


@blueprint.route('/drafts/search')
def drafts_search():
    """Drafts search page."""
    return render_template(current_app.config['DRAFTS_SEARCH_BASE_TEMPLATE'])
