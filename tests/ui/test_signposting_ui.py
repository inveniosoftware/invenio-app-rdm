# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test Signposting.

See https://signposting.org/FAIR/#level2 for more information on Signposting
"""


def test_link_in_landing_page_response_headers(running_app, client, record):
    res = client.head(f"/records/{record.id}")

    assert (
        res.headers["Link"]
        == f'<https://127.0.0.1:5000/api/records/{record.id}> ; rel="linkset" ; type="application/linkset+json"'  # noqa
    )


def test_link_in_content_resource_response_headers(
    running_app, client, record_with_file
):
    filename = "article.txt"

    res = client.head(f"/records/{record_with_file.id}/files/{filename}")

    assert (
        res.headers["Link"]
        == f'<https://127.0.0.1:5000/api/records/{record_with_file.id}> ; rel="linkset" ; type="application/linkset+json"'  # noqa
    )
