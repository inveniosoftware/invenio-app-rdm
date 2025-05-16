# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
# Copyright (C) 2025 Northwestern University.
#
# Invenio-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

import pytest
from invenio_cache import current_cache
from invenio_sitemap import SitemapIndexCache


@pytest.fixture
def cache_for_sitemap_index(app):
    """Primed cache with a sitemap index entry."""
    try:
        cache = SitemapIndexCache(current_cache)
        cache.delete_included_and_higher(0)
        cache.set(0, "unimportant data")
        yield cache
    finally:
        cache.delete_included_and_higher(0)


def test_robotstxt(app, client, cache_for_sitemap_index):
    """Check if robots.txt returns a string response."""
    response = client.get("/robots.txt")

    assert 200 == response.status_code
    assert type(response.text) == str
    assert "Disallow: /search" in response.text
    assert "Disallow: /api" in response.text
    assert "Disallow: /administration" in response.text
    assert "Sitemap: https://127.0.0.1:5000/sitemap_index_0.xml" in response.text
