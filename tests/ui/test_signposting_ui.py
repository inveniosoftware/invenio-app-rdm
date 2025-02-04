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
        # The test record does not have an author with an identifier.
        # The test record does not have a cite-as since it has no DOI.
        f'<{api_url}> ; rel="describedby" ; type="application/dcat+xml"',
        f'<{api_url}> ; rel="describedby" ; type="application/json"',
        f'<{api_url}> ; rel="describedby" ; type="application/ld+json"',
        f'<{api_url}> ; rel="describedby" ; type="application/marcxml+xml"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.citationstyles.csl+json"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.datacite.datacite+json"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.datacite.datacite+xml"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.geo+json"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.inveniordm.v1+json"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.inveniordm.v1.full+csv"',
        f'<{api_url}> ; rel="describedby" ; type="application/vnd.inveniordm.v1.simple+csv"',
        f'<{api_url}> ; rel="describedby" ; type="application/x-bibtex"',
        f'<{api_url}> ; rel="describedby" ; type="application/x-dc+xml"',
        f'<{api_url}> ; rel="describedby" ; type="text/x-bibliography"',
        f'<{ui_url}/files/{filename}> ; rel="item" ; type="text/plain"',
        # The test record does not have a license.
        '<https://schema.org/Photograph> ; rel="type"',
        '<https://schema.org/AboutPage> ; rel="type"',
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
