# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.


def test_static(app, client, es_clear):
    """Check if robots.txt returns a string response."""

    # Save the current static folder to revert after finishing the test.
    app_static_folder = app.static_folder
    # Use as static folder the one of the blueprint we are testing.
    app.static_folder = app.blueprints["invenio_app_rdm"].static_folder

    response = client.get("/robots.txt")

    assert response.status_code == 200
    assert type(response.text) == str
    assert "Disallow: /search" in response.text
    assert "Disallow: /api" in response.text
    assert "Disallow: /administration" in response.text

    app.static_folder = app_static_folder
