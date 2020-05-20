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
from invenio_rdm_records.marshmallow.json import MetadataSchemaV1, dump_empty
from invenio_rdm_records.vocabularies import Vocabularies

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


@blueprint.route('/deposits/new')
def deposits_create():
    """Record creation page."""
    forms_config = dict(
        apiUrl='/api/records/',
        vocabularies=Vocabularies.dump()
    )
    searchbar_config = dict(searchUrl='/search')
    empty_record = dump_empty(MetadataSchemaV1)
    return render_template(
        current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
        forms_config=forms_config,
        record=empty_record,
        searchbar_config=searchbar_config
    )


@blueprint.route('/deposits/<string:id>/edit')
def deposits_edit(id):
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
        "id": "{}".format(id),
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
        }],
        "links": {
            "edit": "/deposits/{}/edit".format(id)
        }
    }
    searchbar_config = dict(searchUrl='/search')

    initial_record = dump_empty(MetadataSchemaV1)
    initial_record.update(record)
    return render_template(
        current_app.config['DEPOSITS_FORMS_BASE_TEMPLATE'],
        forms_config=forms_config,
        record=initial_record,
        searchbar_config=searchbar_config
    )


@blueprint.route('/deposits')
def deposits_user():
    """List of user deposits page."""
    return render_template(
        current_app.config['DEPOSITS_UPLOADS_TEMPLATE'],
        searchbar_config=dict(searchUrl='/search')
    )
