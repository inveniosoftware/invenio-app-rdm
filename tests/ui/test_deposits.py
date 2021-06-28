# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test deposit views."""

from invenio_vocabularies.proxies import current_service as vocabulary_service

from invenio_app_rdm.records_ui.views.deposits import \
    _dump_resource_type_vocabulary, _dump_subjects_vocabulary


def test_dump_resource_type_vocabulary(running_app):
    # Make sure the indexed values are in ES before we start.
    # Don't know why just this test requires this...
    vocabulary_service.record_cls.index.refresh()
    expected = [
        {
            "icon": "chart bar outline",
            "id": "image-photo",
            "subtype_name": "Photo",
            "type_name": "Image",
        }
    ]

    result = _dump_resource_type_vocabulary()

    assert expected == result


def test_dump_subjects_vocabulary(running_app):
    expected = {
        "limit_to": [
            {"text": "All", "value": "all"},
            {"text": "MeSH", "value": "MeSH"},
        ]
    }

    result = _dump_subjects_vocabulary()

    assert expected == result
