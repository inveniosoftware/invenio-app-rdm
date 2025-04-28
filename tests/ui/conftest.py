# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
# Copyright (C) 2024 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Pytest fixtures and plugins for the UI application."""

from io import BytesIO

import pytest
from flask_principal import Identity
from flask_webpackext.manifest import (
    JinjaManifest,
    JinjaManifestEntry,
    JinjaManifestLoader,
)
from invenio_access.permissions import any_user, authenticated_user, system_identity
from invenio_app.factory import create_ui
from invenio_rdm_records.proxies import current_rdm_records
from invenio_search import current_search


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
def index_templates(running_app):
    """Ensure the index templates are in place."""
    list(current_search.put_templates(ignore=[400]))


@pytest.fixture()
def record(running_app, minimal_record):
    """Create and publish a record."""
    s = current_rdm_records.records_service
    draft = s.create(system_identity, minimal_record)
    return s.publish(system_identity, draft.id)


@pytest.fixture()
def draft_with_file(running_app, minimal_record, users):
    """Create a draft with a file."""
    minimal_record["files"] = {"enabled": True}

    # Use a user's identity to make sure the record has an owner
    user_identity = Identity(users["user1"].id)
    user_identity.provides.add(any_user)
    user_identity.provides.add(authenticated_user)
    record_service = current_rdm_records.records_service
    file_service = record_service.draft_files

    draft = record_service.create(user_identity, minimal_record)
    file_to_initialise = [
        {
            "key": "article.txt",
            "checksum": "md5:c785060c866796cc2a1708c997154c8e",
            "size": 17,  # 2kB
            "metadata": {
                "description": "Published article PDF.",
            },
        }
    ]
    file_service.init_files(system_identity, draft.id, file_to_initialise)
    content = BytesIO(b"test file content")
    file_service.set_file_content(
        system_identity,
        draft.id,
        file_to_initialise[0]["key"],
        content,
        content.getbuffer().nbytes,
    )
    file_service.commit_file(system_identity, draft.id, "article.txt")
    return draft


@pytest.fixture()
def record_with_file(draft_with_file):
    """Create and publish a record with file."""
    record_service = current_rdm_records.records_service
    return record_service.publish(system_identity, draft_with_file.id)
