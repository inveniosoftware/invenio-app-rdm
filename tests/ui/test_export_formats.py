# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test that all export formats are working."""

import pytest
from invenio_cache import current_cache


@pytest.fixture(scope="function")
def cache():
    """Clean cache"""
    try:
        current_cache.clear()
        yield current_cache
    finally:
        current_cache.clear()


def test_export_formats(client, running_app, cache, record):
    """Test that all expected export formats are working."""
    # Expected export formats:
    formats = [
        "json",
        "csl",
        "datacite-json",
        "datacite-xml",
        "dublincore",
    ]
    for f in formats:
        res = client.get(f"/records/{record.id}/export/{f}")
        assert res.status_code == 200
