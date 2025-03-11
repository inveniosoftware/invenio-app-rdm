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
@pytest.mark.parametrize("level_1_enabled", [True, False])
def test_link_in_landing_page_response_headers(
    running_app, app, client, record_with_file, http_method, level_1_enabled
):
    previous_config = app.config[
        "APP_RDM_RECORD_LANDING_PAGE_FAIR_SIGNPOSTING_LEVEL_1_ENABLED"
    ]

    if level_1_enabled:
        app.config["APP_RDM_RECORD_LANDING_PAGE_FAIR_SIGNPOSTING_LEVEL_1_ENABLED"] = (
            True
        )

    client_http_method = getattr(client, http_method)
    res = client_http_method(f"/records/{record_with_file.id}")

    # The link headers are already tested in details in `invenio-rdm-records` (see `test_signposting_serializer`).
    # Here we still want to issue the HTTP call to the URL in order to make sure that the decorator is working properly,
    # but the assertions are less detailed to avoid having to adapt this test every time we modify the logic in `invenio-rdm-records`.
    link_headers = res.headers["Link"].split(" , ")

    # The test record does not have:
    # - an author with an identifier.
    # - a cite-as since it has no DOI.
    # - a license.

    # There should be at least one link to a linkset (e.g. "application/linkset" and/or "application/linkset+json")
    assert sum('; rel="linkset" ;' in header for header in link_headers) >= 1

    if level_1_enabled:
        # There should be at least 10 export formats supported (e.g. "application/dcat+xml", "application/x-bibtex", etc.).
        assert sum('; rel="describedby" ;' in header for header in link_headers) >= 10

        # There should be at least one file in the record.
        assert sum('; rel="item" ;' in header for header in link_headers) >= 1

        # There should be at least one description of the type of the record (e.g. "https://schema.org/Photograph").
        assert sum('; rel="type"' in header for header in link_headers) >= 1
    else:
        # The only link headers should be linkset headers.
        assert sum('; rel="linkset" ;' in header for header in link_headers) == len(
            link_headers
        )

    app.config["APP_RDM_RECORD_LANDING_PAGE_FAIR_SIGNPOSTING_LEVEL_1_ENABLED"] = (
        previous_config
    )


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
