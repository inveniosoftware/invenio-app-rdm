# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test that all export formats are working."""


def test_export_formats(client, running_app, minimal_record):
    """Test that all expected export formats are working."""
    # Expected export formats:
    formats = [
        "json",
        "csl",
        "datacite-json",
        "datacite-xml",
        "dublincore",
    ]
    id_ = minimal_record['id']
    for f in formats:
        res = client.get("/records/{id_}/export/{f}")
        assert res.status_code == 200
