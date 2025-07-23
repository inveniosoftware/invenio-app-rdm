# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2024-2025 Graz University of Technology.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 11.0 to 12.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 11.0 to 12.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!


This script has been tested with following data:

- record
    - internal_notes
"""

from click import secho
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_search.engine import dsl


def run_upgrade(has, migrate):
    """Run upgrade."""
    record_success_counter = 0
    record_error_counter = 0
    draft_success_counter = 0
    draft_error_counter = 0

    # Handle published records
    published_records = records_service.search(
        system_identity,
        params={"allversions": True, "include_deleted": True},
        extra_filter=has,
    )
    for result in published_records.hits:
        record = records_service.record_cls.pid.resolve(result["id"])
        try:
            migrate(record)
            record_success_counter += 1
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Record {record.pid.pid_value} failed to update"
            record_error_counter += 1

    # Handle draft records
    draft_records = records_service.search_drafts(
        system_identity,
        params={"allversions": True},
        extra_filter=has,
    )
    for result in draft_records.hits:
        draft = records_service.draft_cls.pid.resolve(
            result["id"],
            registered_only=False,
        )
        try:
            migrate(draft)
            draft_success_counter += 1
        except Exception as error:
            secho(f"> Error {repr(error)}", fg="red")
            error = f"Draft {draft.pid.pid_value} failed to update"
            draft_error_counter += 1

    if draft_error_counter > 0 or record_error_counter > 0:
        db.session.rollback()
        secho(
            f"{record_error_counter} records had failures and {draft_error_counter} drafts had failures",
            fg="red",
        )
        secho(
            "The changes have been rolled back. Please fix the above listed errors and try the upgrade again",
            fg="yellow",
            err=True,
        )
    elif draft_success_counter > 0 or record_success_counter > 0:
        db.session.commit()
        secho(
            f"Migration completed: {record_success_counter} records have been updated and {draft_error_counter} drafts have been updated",
            fg="green",
        )
    else:
        secho(
            "Migration completed: no records or drafts required updating.", fg="green"
        )


def run_upgrade_for_thesis():
    """Run upgrade for thesis."""

    def migrate_thesis_university(record_or_draft):
        custom_fields = record_or_draft.get("custom_fields", {})
        university = custom_fields.get("thesis:university")
        if university and "thesis:thesis" not in custom_fields:
            custom_fields["thesis:thesis"] = {"university": university}

        record_or_draft.commit()

    # Common query filter
    has_thesis = dsl.Q("exists", field="custom_fields.thesis:university")

    secho("Thesis upgrade has started.", fg="green")

    run_upgrade(has_thesis, migrate_thesis_university)

    secho("Thesis upgrade has finished.", fg="green")


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 12.0 to 13.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    THIS MODULE IS WORK IN PROGRESS, UNTIL official v13 release

    NOTE:
    since the data upgrade steps are more selective now, the approach how to do
    it has been changed. now the records/drafts which should be updated are
    searched by a filter and then the updates are applied to those
    records/drafts explicitly. this should improve speed and should make it
    easier to upgrade large instances

    """
    secho("Starting data migration...", fg="green")

    run_upgrade_for_thesis()


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
