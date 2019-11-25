# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Module tests.

TODO: Remove tests below because they are now covered in invenio-rdm-records.
"""

from __future__ import absolute_import, print_function

import json

from invenio_search import current_search


def assert_single_hit(response, expected_record):
    assert response.status_code == 200

    search_hits = response.json['hits']['hits']

    # Kept for debugging
    for hit in search_hits:
        print("Search hit:", json.dumps(hit, indent=4, sort_keys=True))

    assert len(search_hits) == 1

    search_hit = search_hits[0]
    for key in ['created', 'updated', 'metadata', 'links']:
        assert key in search_hit

    assert search_hit['metadata']['title'] == expected_record['title']


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

    # retrieve records
    response = client.get('https://localhost:5000/records/')
    assert_single_hit(response, data)
