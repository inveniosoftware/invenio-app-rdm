# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 13.0 to 14.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 13.0 to 14.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!


This script has been tested for the following scenarios:
1. Draft with resource type publication-thesis
2. Record with resource type publication-thesis with a DOI and no draft
3. Record with resource type publication-thesis with a no DOI and an existing draft
4. Records with multiple versions
"""

from click import secho
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_drafts_resources.resources.records.errors import DraftNotCreatedError
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_rdm_records.records.api import RDMDraft, RDMRecord
from invenio_search.api import RecordsSearchV2


def run_upgrade(migrate_record, migrate_draft):
    """Run upgrade on selected records and drafts.

    Args:
        migrate_record (callable): Function to migrate a record.
        migrate_draft (callable): Function to migrate a draft.
    """
    errored_record_ids = []
    errored_draft_ids = []

    # Handle published records
    published_records = (
        RecordsSearchV2(index=records_service.record_cls.index._name)
        .filter("term", deletion_status="P")
        .filter(
            "query_string",
            query="metadata.resource_type.id:publication-thesis OR metadata.related_identifiers.resource_type.id:publication-thesis",
        )
        .source(["id"])
        .scan()
    )  # Only need to fetch the record IDs to make the query faster
    # Convert the search results to a list to avoid keeping the scroll context open, as it errors out after 15 minutes
    published_record_ids = [result["id"] for result in published_records]
    for record_id in published_record_ids:
        try:
            migrate_record(record_id)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            secho(f"Record {record_id} failed to update", fg="red")
            errored_record_ids.append((record_id, error))

    # Handle draft records
    draft_records = (
        RecordsSearchV2(index=records_service.draft_cls.index._name)
        .filter("term", has_draft=False)
        .filter(
            "query_string",
            query="metadata.resource_type.id:publication-thesis OR metadata.related_identifiers.resource_type.id:publication-thesis",
        )
        .source(["id"])
        .scan()
    )
    # Convert the search results to a list to avoid keeping the scroll context open, as it errors out after 15 minutes
    draft_record_ids = [result["id"] for result in draft_records]
    for draft_id in draft_record_ids:
        try:
            migrate_draft(draft_id)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            secho(f"Draft {draft_id} failed to update", fg="red")
            errored_draft_ids.append((draft_id, error))

    print(f"Errored record IDs:", *errored_record_ids, sep="\n")
    print(f"Errored draft IDs:", *errored_draft_ids, sep="\n")


def run_update_for_resource_type():
    """Run update for resource type."""

    def migrate_resource_type_in_record(record_id):
        """
        Update resource type from publication-thesis to publication-dissertation.

        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        secho(f"Updating resource type for record {record_id}", fg="yellow")
        record = records_service.read(system_identity, record_id)
        if record.data["metadata"]["resource_type"][
            "id"
        ] != "publication-thesis" and not any(
            related_identifier.get("resource_type", {}).get("id")
            == "publication-thesis"
            for related_identifier in record.data["metadata"].get(
                "related_identifiers", []
            )
        ):
            secho(
                f"Skipping record <{record.id}> because it doesn't have resource-type 'publication-thesis'!",
                fg="yellow",
            )
            return

        try:
            draft = records_service.read_draft(system_identity, record.id)
            # Step 1: Update the resource type in the record via low-level API
            # We need to make sure we don't publish the record with different metadata
            secho(
                f"Record <{record.id}> has an existing draft <{draft.id}>! Updating record via low-level API.",
                fg="yellow",
            )
            # Update the record directly without affecting the draft
            if (
                record._record["metadata"]["resource_type"]["id"]
                == "publication-thesis"
            ):
                record._record["metadata"]["resource_type"][
                    "id"
                ] = "publication-dissertation"
            for related_identifier in record._record["metadata"].get(
                "related_identifiers", []
            ):
                if (
                    related_identifier.get("resource_type", {}).get("id")
                    == "publication-thesis"
                ):
                    related_identifier["resource_type"][
                        "id"
                    ] = "publication-dissertation"
            # Save the record changes and reindex
            secho(
                f"Record <{record.id}> has been updated... committing changes.",
                fg="green",
            )
            record._record.commit()
            # Step 2: Update the resource type in the draft
            if draft._record["metadata"]["resource_type"]["id"] == "publication-thesis":
                draft._record["metadata"]["resource_type"][
                    "id"
                ] = "publication-dissertation"
            for related_identifier in draft._record["metadata"].get(
                "related_identifiers", []
            ):
                if (
                    related_identifier.get("resource_type", {}).get("id")
                    == "publication-thesis"
                ):
                    related_identifier["resource_type"][
                        "id"
                    ] = "publication-dissertation"
            # After updating the record, update the draft's fork_version_id to match the record's new version_id, to avoid conflicts when publishing
            draft._record.fork_version_id = record._record.revision_id
            draft._record.commit()
            # Commit the changes for both the record and the draft in one transaction
            db.session.commit()
            records_service.indexer.index(record._record)
            records_service.indexer.index(draft._record)
            secho(f"Draft <{draft.id}> has been updated successfully.", fg="green")
            # Update DOI metadata if record has DOI
            if hasattr(record, "pids") and record.pids.get("doi", None):
                records_service.pids.register_or_update(
                    system_identity, record.id, "doi", parent=False
                )
                secho(
                    f"DOI metadata for record {record.id} has been updated successfully.",
                    fg="green",
                )
        except DraftNotCreatedError:
            # If the draft didn't exist, we simply edit and publish the record
            draft = records_service.edit(system_identity, record.id)
            if draft.data["metadata"]["resource_type"]["id"] == "publication-thesis":
                draft.data["metadata"]["resource_type"][
                    "id"
                ] = "publication-dissertation"
            for related_identifier in draft.data["metadata"].get(
                "related_identifiers", []
            ):
                if (
                    related_identifier.get("resource_type", {}).get("id")
                    == "publication-thesis"
                ):
                    related_identifier["resource_type"][
                        "id"
                    ] = "publication-dissertation"
            updated_draft = records_service.update_draft(
                system_identity, draft.id, draft.data
            )
            record = records_service.publish(system_identity, updated_draft.id)

        secho(f"Record <{record.id}> has been updated successfully.", fg="green")

    def migrate_resource_type_in_draft(draft_id):
        """
        Update resource type from publication-thesis to publication-dissertation.

        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        secho(f"Updating resource type for draft {draft_id}", fg="yellow")
        draft = records_service.edit(system_identity, draft_id)
        if draft.data["metadata"]["resource_type"][
            "id"
        ] != "publication-thesis" and not any(
            related_identifier.get("resource_type", {}).get("id")
            == "publication-thesis"
            for related_identifier in draft.data["metadata"].get(
                "related_identifiers", []
            )
        ):
            secho(
                f"Skipping draft <{draft.id}> because it doesn't have resource-type 'publication-thesis'!",
                fg="yellow",
            )
            return

        if draft.data["metadata"]["resource_type"]["id"] == "publication-thesis":
            draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
        for related_identifier in draft.data["metadata"].get("related_identifiers", []):
            if (
                related_identifier.get("resource_type", {}).get("id")
                == "publication-thesis"
            ):
                related_identifier["resource_type"]["id"] = "publication-dissertation"
        updated_draft = records_service.update_draft(
            system_identity, draft.id, draft.data
        )
        secho(f"Draft <{updated_draft.id}> has been updated successfully.", fg="green")

    secho("Resource type update has started.", fg="green")

    run_upgrade(
        migrate_resource_type_in_record,
        migrate_resource_type_in_draft,
    )

    secho("Resource type update has finished.", fg="green")


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 13.0 to 14.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    THIS MODULE IS WORK IN PROGRESS, UNTIL official v14 release

    NOTE:
    since the data upgrade steps are more selective now, the approach how to do
    it has been changed. now the records/drafts which should be updated are
    searched by a filter and then the updates are applied to those
    records/drafts explicitly. this should improve speed and should make it
    easier to upgrade large instances

    """
    secho("Starting data migration...", fg="green")

    run_update_for_resource_type()


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
