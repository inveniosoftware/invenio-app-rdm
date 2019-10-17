# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University,
#                    Galter Health Sciences Library & Learning Center.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Module tests."""

from __future__ import absolute_import, print_function

import json

from invenio_search import current_search


# TODO: Align this with invenio-rdm-records tests
def test_simple_flow(client, location):
    """Test simple flow using REST API."""
    # TODO pass headers and data to fixture
    headers = [('Content-Type', 'application/json')]
    data = {
            'access': {
                'metadata_restricted': 'false',
                'files_restricted': 'false'
            },
            'access_right': 'open',
            'title': 'The title of the record',
            'contributors': [
                {'name': 'Ellis Jonathan'}
            ],
            'owners': [1]
        }

    # TODO: use urlfor
    url = 'https://localhost:5000/records/'

    # create a record
    response = client.post(url, data=json.dumps(data), headers=headers)
    assert response.status_code == 201
    current_search.flush_and_refresh('records')

    # retrieve record
    res = client.get('https://localhost:5000/records/1')
    assert res.status_code == 200
