# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Tests for migration script from InvenioRDM 13.0 to 14.0."""

import pytest
from invenio_access.permissions import system_identity
from invenio_rdm_records.records.api import RDMDraft, RDMRecord
from invenio_search.engine import dsl
from invenio_vocabularies.proxies import current_service as vocabulary_service

from invenio_app_rdm.upgrade_scripts.migrate_13_0_to_14_0 import execute_upgrade


@pytest.fixture
def thesis_resource_type(app, db):
    """Create publication-thesis and publication-dissertation resource types for testing."""
    vocabulary_service.create_type(system_identity, "resourcetypes", "rsrct")
    db.session.commit()
    vocabulary_service.create(
        system_identity,
        {
            "id": "publication-thesis",
            "icon": "file alternate",
            "props": {
                "csl": "thesis",
                "datacite_general": "Text",
                "datacite_type": "Thesis",
                "openaire_resourceType": "0006",
                "openaire_type": "publication",
                "eurepo": "info:eu-repo/semantics/doctoralThesis",
                "schema.org": "https://schema.org/Thesis",
                "subtype": "publication-thesis",
                "type": "publication",
                "marc21_type": "publication",
                "marc21_subtype": "thesis",
            },
            "title": {
                "en": "Thesis",
                "sv": "Avhandling",
                "de": "Abschlussarbeit",
                "cs": "Závěrečná práce",
            },
            "tags": ["depositable", "linkable"],
            "type": "resourcetypes",
        },
    )
    vocabulary_service.create(
        system_identity,
        {
            "id": "publication-dissertation",
            "icon": "file alternate",
            "props": {
                "csl": "article",
                "datacite_general": "Dissertation",
                "datacite_type": "",
                "openaire_resourceType": "0044",
                "openaire_type": "publication",
                "eurepo": "info:eu-repo/semantics/other",
                "schema.org": "https://schema.org/Thesis",
                "subtype": "publication-dissertation",
                "type": "publication",
                "marc21_type": "publication",
                "marc21_subtype": "dissertation",
            },
            "title": {
                "en": "Dissertation",
                "sv": "Avhandling",
                "de": "Dissertation",
                "cs": "Disertační práce",
            },
            "tags": ["depositable", "linkable"],
            "type": "resourcetypes",
        },
    )
    vocabulary_service.create(
        system_identity,
        {
            "id": "publication-article",
            "icon": "file alternate",
            "props": {
                "csl": "article",
                "datacite_general": "Article",
                "datacite_type": "",
                "openaire_resourceType": "0002",
                "openaire_type": "publication",
                "eurepo": "info:eu-repo/semantics/article",
                "schema.org": "https://schema.org/Article",
                "subtype": "publication-article",
                "type": "publication",
                "marc21_type": "publication",
                "marc21_subtype": "article",
            },
            "title": {
                "en": "Article",
                "sv": "Artikel",
                "de": "Artikel",
                "cs": "Článek",
            },
            "tags": ["depositable", "linkable"],
            "type": "resourcetypes",
        },
    )
    db.session.commit()


@pytest.fixture
def thesis_record_data():
    """Test record data with publication-thesis resource type."""
    return {
        "files": {"enabled": False},
        "media_files": {"enabled": False},
        "metadata": {
            "publication_date": "2024-01-01",
            "resource_type": {
                "id": "publication-thesis",
            },
            "creators": [
                {
                    "person_or_org": {
                        "type": "personal",
                        "name": "Doe, John",
                        "given_name": "John",
                        "family_name": "Doe",
                    }
                }
            ],
            "title": "Test Thesis Record",
            "publisher": "Test Publisher",
        },
    }


@pytest.fixture
def thesis_draft_data():
    """Test draft data with publication-thesis resource type."""
    return {
        "files": {"enabled": False},
        "media_files": {"enabled": False},
        "metadata": {
            "publication_date": "2024-01-01",
            "resource_type": {
                "id": "publication-thesis",
            },
            "creators": [
                {
                    "person_or_org": {
                        "type": "personal",
                        "name": "Smith, Jane",
                        "given_name": "Jane",
                        "family_name": "Smith",
                    }
                }
            ],
            "title": "Test Thesis Draft",
            "publisher": "Test Publisher",
        },
    }


class TestMigration13To14:
    """Test migration from InvenioRDM 13.0 to 14.0."""

    def test_migration(
        self,
        records_service,
        thesis_resource_type,
        thesis_record_data,
        thesis_draft_data,
        location,
    ):
        """Test complete migration scenario with all record types."""
        # Create test data with various scenarios

        # 1. Published record without draft
        draft = records_service.create(system_identity, thesis_record_data)
        record_without_draft = records_service.publish(system_identity, draft.id)

        # 2. Published record with draft
        draft = records_service.create(system_identity, thesis_record_data)
        record_with_draft = records_service.publish(system_identity, draft.id)

        # Create draft for the published record
        draft_with_record = records_service.edit(system_identity, record_with_draft.id)
        draft_with_record.data["metadata"]["title"] = "Updated Title in Draft"
        records_service.update_draft(
            system_identity, draft_with_record.id, draft_with_record.data
        )

        # 3. Records with multiple versions
        old_version_draft = records_service.create(system_identity, thesis_record_data)
        old_version_record = records_service.publish(
            system_identity, old_version_draft.id
        )

        new_version_draft = records_service.new_version(
            system_identity, old_version_record.id
        )
        new_version_draft.data["metadata"][
            "title"
        ] = "Updated Title in New Version Record"
        new_version_draft.data["metadata"]["publication_date"] = "2024-02-01"
        new_version_draft = records_service.update_draft(
            system_identity, new_version_draft.id, new_version_draft.data
        )
        new_version_record = records_service.publish(
            system_identity, new_version_draft.id
        )
        old_version_draft = records_service.edit(system_identity, old_version_record.id)
        old_version_draft.data["metadata"][
            "title"
        ] = "Updated Title in Old Version Draft"
        old_version_draft = records_service.update_draft(
            system_identity, old_version_draft.id, old_version_draft.data
        )

        # 4. Draft-only
        draft_only = records_service.create(system_identity, thesis_draft_data)

        # 5. Non-thesis record (should not be affected)
        thesis_record_data["metadata"]["resource_type"]["id"] = "publication-article"
        non_thesis_draft = records_service.create(system_identity, thesis_record_data)
        non_thesis_record = records_service.publish(
            system_identity, non_thesis_draft.id
        )

        non_thesis_draft = records_service.create(system_identity, thesis_record_data)
        non_thesis_draft.data["metadata"]["title"] = "Updated Title in Non-Thesis Draft"
        non_thesis_draft = records_service.update_draft(
            system_identity, non_thesis_draft.id, non_thesis_draft.data
        )

        # 6. Deleted record (should not be affected)
        draft_to_delete = records_service.create(system_identity, thesis_record_data)
        draft_to_delete.data["metadata"]["title"] = "Title in record to delete"
        draft_to_delete = records_service.update_draft(
            system_identity, draft_to_delete.id, draft_to_delete.data
        )
        record_to_delete = records_service.publish(system_identity, draft_to_delete.id)
        records_service.delete(system_identity, record_to_delete.id)

        # Run the complete migration
        execute_upgrade()

        # Refresh indices before searching and testing
        RDMDraft.index.refresh()
        RDMRecord.index.refresh()

        # Verify all thesis records were migrated
        thesis_records = records_service.search(
            system_identity,
            params={"allversions": True},
            extra_filter=dsl.Q(
                "term", **{"metadata.resource_type.id": "publication-thesis"}
            ),
        )
        assert thesis_records.total == 0

        # Verify all thesis drafts were migrated
        thesis_drafts = records_service.search_drafts(
            system_identity,
            params={"allversions": True},
            extra_filter=dsl.Q(
                "term", **{"metadata.resource_type.id": "publication-thesis"}
            ),
        )
        assert thesis_drafts.total == 0

        # Verify published record with draft was also migrated
        record_with_draft = records_service.read(system_identity, record_with_draft.id)
        assert (
            record_with_draft.data["metadata"]["resource_type"]["id"]
            == "publication-dissertation"
        )
        assert record_with_draft.data["metadata"]["title"] == "Test Thesis Record"

        # Verify draft for the published record was also migrated
        draft_with_record = records_service.read_draft(
            system_identity, draft_with_record.id
        )
        assert (
            draft_with_record.data["metadata"]["resource_type"]["id"]
            == "publication-dissertation"
        )
        assert draft_with_record.data["metadata"]["title"] == "Updated Title in Draft"

        # Verify non-thesis record was not affected
        non_thesis_record = records_service.read(system_identity, non_thesis_record.id)
        assert (
            non_thesis_record.data["metadata"]["resource_type"]["id"]
            == "publication-article"
        )

        # Verify record with multiple versions was also migrated
        new_version_record = records_service.read(
            system_identity, new_version_record.id
        )
        assert (
            new_version_record.data["metadata"]["resource_type"]["id"]
            == "publication-dissertation"
        )
        assert (
            new_version_record.data["metadata"]["title"]
            == "Updated Title in New Version Record"
        )

        # Verify old version draft for the record with multiple versions was also migrated
        old_version_draft = records_service.read_draft(
            system_identity, old_version_draft.id
        )
        assert (
            old_version_draft.data["metadata"]["resource_type"]["id"]
            == "publication-dissertation"
        )
        assert (
            old_version_draft.data["metadata"]["title"]
            == "Updated Title in Old Version Draft"
        )
