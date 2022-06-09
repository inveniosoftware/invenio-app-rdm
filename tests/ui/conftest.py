# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Pytest fixtures and plugins for the UI application."""

import pytest
from flask_webpackext.manifest import (
    JinjaManifest,
    JinjaManifestEntry,
    JinjaManifestLoader,
)
from invenio_access.permissions import system_identity
from invenio_app.factory import create_ui
from invenio_rdm_records.proxies import current_rdm_records


#
# Mock the webpack manifest to avoid having to compile the full assets.
#
class MockJinjaManifest(JinjaManifest):
    """Mock manifest."""

    def __getitem__(self, key):
        """Get a manifest entry."""
        return JinjaManifestEntry(key, [key])

    def __getattr__(self, name):
        """Get a manifest entry."""
        return JinjaManifestEntry(name, [name])


class MockManifestLoader(JinjaManifestLoader):
    """Manifest loader creating a mocked manifest."""

    def load(self, filepath):
        """Load the manifest."""
        return MockJinjaManifest()


@pytest.fixture(scope="module")
def app_config(app_config):
    """Create test app."""
    app_config["WEBPACKEXT_MANIFEST_LOADER"] = MockManifestLoader
    return app_config


@pytest.fixture(scope="module")
def create_app():
    """Create test app."""
    return create_ui


@pytest.fixture()
def record(running_app, minimal_record):
    """Create and publish a record."""
    s = current_rdm_records.records_service
    draft = s.create(system_identity, minimal_record)
    return s.publish(system_identity, draft.id)
