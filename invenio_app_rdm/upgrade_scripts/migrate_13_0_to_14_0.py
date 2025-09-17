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


This script has been tested with following data:

- record
    - internal_notes
"""

from click import secho
from invenio_access.permissions import system_identity
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_search.engine import dsl


def run_upgrade(has, migrate_record, migrate_draft):
    """Run upgrade."""
    # Handle published records
    published_records = records_service.search(
        system_identity,
        params={"allversions": True, "include_deleted": True},
        extra_filter=has,
    )
    for result in published_records.hits:
        try:
            migrate_record(result)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Record {result['id']} failed to update"

    # Handle draft records
    draft_records = records_service.search_drafts(
        system_identity,
        params={"allversions": True},
        extra_filter=has,
    )
    for result in draft_records.hits:
        try:
            migrate_draft(result)
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Draft {result['id']} failed to update"


def run_update_for_resource_type():
    """Run update for resource type."""

    def migrate_resource_type_in_record(hit_result):
        """
        Update resource type from event to publication-dissertation.
        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        print(f"Updating resource type for {hit_result['id']}")
        record = records_service.read_latest(system_identity, hit_result["id"])
        if record.data["metadata"]["resource_type"]["id"] != "event":
            secho(
                f"Skipping record <{record.id}> because it doesn't have resource-type 'event'!",
                fg="yellow",
            )
            return

        draft = records_service.edit(system_identity, record.id)
        if draft.data["metadata"] != record.data["metadata"]:
            secho(
                f"Record <{record.id}> has an existing draft <{draft.id}> with different metadata! Updating record with record's metadata and re-creating draft with new metadata.",
                fg="yellow",
            )
            # Store the existing draft metadata
            new_draft_metadata = draft.data["metadata"]
            # Delete the existing draft
            is_draft_deleted = records_service.delete_draft(system_identity, draft.id)
            if not is_draft_deleted:
                secho(f"Failed to delete draft <{draft.id}>! Skipping...", fg="red")
                return
            # Create a temporary draft with the record's metadata and update the resource type
            temp_draft = records_service.edit(system_identity, record.id)
            temp_draft.data["metadata"]["resource_type"][
                "id"
            ] = "publication-dissertation"
            updated_draft = records_service.update_draft(
                system_identity, temp_draft.id, temp_draft.data
            )
            updated_record = records_service.publish(system_identity, updated_draft.id)

            # Create a new draft with the existing draft's metadata and update the resource type again
            new_draft = records_service.edit(system_identity, record.id)
            new_draft.data["metadata"] = new_draft_metadata
            new_draft.data["metadata"]["resource_type"][
                "id"
            ] = "publication-dissertation"
            updated_draft = records_service.update_draft(
                system_identity, new_draft.id, new_draft.data
            )
        else:
            # If the draft has the same metadata as the record, just update the resource type
            draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
            updated_draft = records_service.update_draft(
                system_identity, draft.id, draft.data
            )
            updated_record = records_service.publish(system_identity, updated_draft.id)
        secho(
            f"Record <{updated_record.id}> has been updated successfully.", fg="green"
        )

    def migrate_resource_type_in_draft(hit_result):
        """
        Update resource type from event to publication-dissertation.
        We go through the service layer to automatically trigger the DOI update and re-indexing.
        """
        print(f"Updating resource type for {hit_result['id']}")
        draft = records_service.edit(system_identity, hit_result["id"])
        if draft.data["metadata"]["resource_type"]["id"] != "event":
            secho(
                f"Skipping draft <{draft.id}> because it doesn't have resource-type 'event'!",
                fg="yellow",
            )
            return

        draft.data["metadata"]["resource_type"]["id"] = "publication-dissertation"
        updated_draft = records_service.update_draft(
            system_identity, draft.id, draft.data
        )
        secho(f"Draft <{updated_draft.id}> has been updated successfully.", fg="green")

    # Common query filter
    has_resource_type = dsl.Q("query_string", query="metadata.resource_type.id:event")

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
