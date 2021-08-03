# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test deposit views."""

import pytest
from elasticsearch_dsl import Q
from invenio_access.permissions import system_identity
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.api import Vocabulary

from invenio_app_rdm.records_ui.views.deposits import VocabulariesOptions


@pytest.fixture()
def additional_resource_types(running_app):
    """Resource type vocabulary record."""
    vocabulary_service.create(system_identity, {
        "id": "publication",
        "icon": "file alternate",
        "props": {
            "csl": "report",
            "datacite_general": "Text",
            "datacite_type": "",
            "eurepo": "info:eu-repo/semantics/other",
            "openaire_resourceType": "17",
            "openaire_type": "publication",
            "schema.org": "https://schema.org/CreativeWork",
            "subtype": "",
            "type": "publication",
        },
        "title": {
            "en": "Publication"
        },
        "tags": ["depositable", "linkable"],
        "type": "resourcetypes"
    })
    vocabulary_service.create(system_identity, {
        "id": "publication-annotationcollection",
        "icon": "file alternate",
        "props": {
            "csl": "report",
            "datacite_general": "Collection",
            "datacite_type": "",
            "eurepo": "info:eu-repo/semantics/technicalDocumentation",
            "openaire_resourceType": "9",
            "openaire_type": "publication",
            "schema.org": "https://schema.org/Collection",
            "subtype": "publication-annotationcollection",
            "type": "publication",
        },
        "title": {
            "en": "Annotation collection"
        },
        "tags": ["depositable", "linkable"],
        "type": "resourcetypes"
    })

    Vocabulary.index.refresh()


def test_resource_types(additional_resource_types):
    options = VocabulariesOptions()
    expected = [
        # If no corresponding parent type entry (e.g. image-photo), type_name
        # is own title and subtype_name is empty.
        {
            "icon": "chart bar outline",
            "id": "image-photo",
            "subtype_name": "",
            "type_name": "Photo",
        },
        # If parent type is itself (e.g. Publication), type_name is own title
        # and subtype_name is empty.
        {
            "icon": "file alternate",
            "id": "publication",
            "subtype_name": "",
            "type_name": "Publication",
        },
        # If corresponding parent type entry, type_name is parent's title
        # and subtype_name is own title.
        {
            "icon": "file alternate",
            "id": "publication-annotationcollection",
            "subtype_name": "Annotation collection",
            "type_name": "Publication",
        }
    ]

    # the choice of this filter isn't important for the test
    result = options._resource_types(Q('term', tags="depositable"))

    sorted_result = sorted(result, key=lambda e: e["id"])
    assert expected == sorted_result


def test_dump_subjects_vocabulary(running_app):
    options = VocabulariesOptions()
    expected = {
        "limit_to": [
            {"text": "All", "value": "all"},
            {"text": "MeSH", "value": "MeSH"},
        ]
    }

    result = options.subjects()

    assert expected == result
