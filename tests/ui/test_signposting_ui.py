# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test Signposting.

See https://signposting.org/FAIR/#level2 for more information on Signposting
"""
import pytest


@pytest.mark.parametrize("http_method", ["head", "get"])
def test_link_in_landing_page_response_headers(
    running_app, client, record_with_file, http_method
):
    ui_url = f"https://127.0.0.1:5000/records/{record_with_file.id}"
    api_url = f"https://127.0.0.1:5000/api/records/{record_with_file.id}"
    filename = "article.txt"

    client_http_method = getattr(client, http_method)
    res = client_http_method(f"/records/{record_with_file.id}")

    assert res.headers["Link"].split(" , ") == [
        f'<{ui_url}> ; rel="cite-as"',
        '<https://schema.org/Photograph> ; rel="type"',
        '<https://schema.org/AboutPage> ; rel="type"',
        # The test record does not have an author with an identifier.
        f'<{ui_url}/export/json> ; rel="describedby" ; type="application/json"',
        f'<{ui_url}/export/json-ld> ; rel="describedby" ; type="application/ld+json"',
        f'<{ui_url}/export/csl> ; rel="describedby" ; type="application/vnd.citationstyles.csl+json"',
        f'<{ui_url}/export/datacite-json> ; rel="describedby" ; type="application/vnd.datacite.datacite+json"',
        f'<{ui_url}/export/datacite-xml> ; rel="describedby" ; type="application/vnd.datacite.datacite+xml"',
        f'<{ui_url}/export/dublincore> ; rel="describedby" ; type="application/x-dc+xml"',
        f'<{ui_url}/export/marcxml> ; rel="describedby" ; type="application/marcxml+xml"',
        f'<{ui_url}/export/bibtex> ; rel="describedby" ; type="application/x-bibtex"',
        f'<{ui_url}/export/geojson> ; rel="describedby" ; type="application/vnd.geo+json"',
        f'<{ui_url}/export/dcat-ap> ; rel="describedby" ; type="application/dcat+xml"',
        f'<{ui_url}/export/codemeta> ; rel="describedby" ; type="application/ld+json"',
        f'<{ui_url}/export/cff> ; rel="describedby" ; type="application/x-yaml"',
        # The test record does not have a license.
        f'<{ui_url}/files/{filename}> ; rel="item" ; type="text/plain"',
        f'<{api_url}> ; rel="linkset" ; type="application/linkset+json"',
    ]


@pytest.mark.parametrize("http_method", ["head", "get"])
def test_link_in_content_resource_response_headers(
    running_app, client, record_with_file, http_method
):
    ui_url = f"https://127.0.0.1:5000/records/{record_with_file.id}"
    api_url = f"https://127.0.0.1:5000/api/records/{record_with_file.id}"
    filename = "article.txt"

    client_http_method = getattr(client, http_method)
    res = client_http_method(f"/records/{record_with_file.id}/files/{filename}")

    assert res.headers["Link"].split(" , ") == [
        f'<{ui_url}> ; rel="collection" ; type="text/html"',
        f'<{api_url}> ; rel="linkset" ; type="application/linkset+json"',
    ]


@pytest.mark.parametrize("http_method", ["head", "get"])
def test_link_in_metadata_resource_response_headers(
    running_app, client, record, http_method
):
    ui_url = f"https://127.0.0.1:5000/records/{record.id}"
    api_url = f"https://127.0.0.1:5000/api/records/{record.id}"

    client_http_method = getattr(client, http_method)
    res = client_http_method(f"/records/{record.id}/export/bibtex")

    assert res.headers["Link"].split(" , ") == [
        f'<{ui_url}> ; rel="describes" ; type="text/html"',
        f'<{api_url}> ; rel="linkset" ; type="application/linkset+json"',
    ]
