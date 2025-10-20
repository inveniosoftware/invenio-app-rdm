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

import time

from click import secho
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_drafts_resources.resources.records.errors import DraftNotCreatedError
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_search.engine import dsl


def run_upgrade(has, migrate_record, migrate_draft):
    """Run upgrade on selected records and drafts.

    Args:
        has (dsl.Q): Query filter to select records/drafts to update.
        migrate_record (callable): Function to migrate a record.
        migrate_draft (callable): Function to migrate a draft.
    """
    # Handle published records
    published_records = records_service.scan(
        identity=system_identity,
        params={"allversions": True},
        extra_filter=has,
    )
    for result in published_records.hits:
        try:
            migrate_record(result)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Record {result['id']} failed to update"

    # Handle draft records
    draft_records = records_service._search(
        identity=system_identity,
        action="scan",
        params={"allversions": True},
        search_preference=None,
        record_cls=records_service.draft_cls,
        search_opts=records_service.config.search_drafts,
        extra_filter=has,
        permission_action="read_draft",
    ).scan()
    for result in draft_records:
        try:
            migrate_draft(result)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Draft {result['id']} failed to update"


def run_update_for_resource_type():
    """Run update for resource type."""

    def migrate_resource_type_in_record(hit_result):
        """
        Update resource type from publication-thesis to publication-dissertation.

        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        secho(f"Updating resource type for record {hit_result['id']}", fg="yellow")
        record = records_service.read(system_identity, hit_result["id"])
        if record.data["metadata"]["resource_type"]["id"] != "publication-thesis":
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
            record._record["metadata"]["resource_type"][
                "id"
            ] = "publication-dissertation"
            # Save the record changes and reindex
            record._record.commit()
            db.session.commit()
            records_service.indexer.index(record._record)
            # Update DOI metadata if record has DOI
            if hasattr(record, "pids") and record.pids.get("doi", None):
                records_service.pids.register_or_update(
                    system_identity, record.id, "doi", parent=False
                )
            # Step 2: Update the resource type in the draft
            secho(f"Updating resource type for draft {draft.id}", fg="yellow")
            draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
            # After updating the record, update the draft's fork_version_id to match the record's new version_id, to avoid conflicts when publishing
            draft._record.fork_version_id = record._record.revision_id
            updated_draft = records_service.update_draft(
                system_identity, draft.id, draft.data
            )
            secho(f"Draft {draft.id} has been updated successfully.", fg="green")
        except DraftNotCreatedError:
            # If the draft didn't exist, we simply edit and publish the record
            draft = records_service.edit(system_identity, record.id)
            draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
            updated_draft = records_service.update_draft(
                system_identity, draft.id, draft.data
            )
            record = records_service.publish(system_identity, updated_draft.id)

        secho(f"Record <{record.id}> has been updated successfully.", fg="green")

    def migrate_resource_type_in_draft(hit_result):
        """
        Update resource type from publication-thesis to publication-dissertation.

        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        secho(f"Updating resource type for draft {hit_result['id']}", fg="yellow")
        draft = records_service.edit(system_identity, hit_result["id"])
        if draft.data["metadata"]["resource_type"]["id"] != "publication-thesis":
            secho(
                f"Skipping draft <{draft.id}> because it doesn't have resource-type 'publication-thesis'!",
                fg="yellow",
            )
            return

        draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
        updated_draft = records_service.update_draft(
            system_identity, draft.id, draft.data
        )
        secho(f"Draft <{updated_draft.id}> has been updated successfully.", fg="green")

    # Query records/drafts with resource type publication-thesis
    has_resource_type = dsl.Q(
        "query_string", query="metadata.resource_type.id:publication-thesis"
    )

    secho("Resource type update has started.", fg="green")

    run_upgrade(
        has_resource_type,
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
