# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2025 CERN.
# Copyright (C) 2024-2025 Graz University of Technology.
# Copyright (C) 2025 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 12.0 to 13.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 12.0 to 13.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!


This script has been tested with following data:

- record
    - internal_notes
"""

import sys
import traceback

from click import secho
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_search import current_search_client as search_client
from invenio_search.engine import dsl
from invenio_search.utils import prefix_index
from invenio_vocabularies.contrib.affiliations.api import Affiliation
from invenio_vocabularies.contrib.names.api import Name
from sqlalchemy import select


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
            f"Migration failed: {record_error_counter} records had failures and {draft_error_counter} drafts had failures",
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
            f"Migration completed: {record_success_counter} records have been updated and {draft_success_counter} drafts have been updated",
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


def run_upgrade_for_affiliations():
    """Update affiliations entry so that they conform to new shape."""
    secho("Affiliations upgrade has started.", fg="green")

    error = False
    # Batch intake to limit memory usage
    stmt = select(Affiliation.model_cls).execution_options(yield_per=250)

    for affiliation_model in db.session.scalars(stmt):
        try:
            data_for_affiliation = affiliation_model.data
            data_for_affiliation.pop("id", None)
            data_for_affiliation.pop("pid", None)
            affiliation = Affiliation(data_for_affiliation, model=affiliation_model)
            affiliation.commit()
        except Exception as e:
            secho(f"Migration failed with '{repr(e)}'.", fg="red")
            secho(f"Affiliation {affiliation_model.pid} failed to update", fg="red")
            trace = traceback.format_exc()
            secho(f"Traceback {trace}", fg="red")
            error = True
            break

    if error:
        db.session.rollback()
        secho("Affiliations upgrade failed.", fg="red")
        sys.exit(1)
    else:
        db.session.commit()
        secho("Affiliations upgrade succeeded.", fg="green")


def run_upgrade_for_names():
    """Update names entry so that they conform to new shape."""
    secho("Names upgrade has started.", fg="green")

    error = False
    # Batch intake to limit memory usage
    stmt = select(Name.model_cls).execution_options(yield_per=250)

    for name_model in db.session.scalars(stmt):
        try:
            data_for_name = name_model.data
            data_for_name.pop("id", None)
            data_for_name.pop("pid", None)
            name = Name(data_for_name, model=name_model)
            name.commit()
        except Exception as e:
            secho(f"Migration failed with '{repr(e)}'.", fg="red")
            secho(f"Name {name_model.pid} failed to update", fg="red")
            trace = traceback.format_exc()
            secho(f"Traceback {trace}", fg="red")
            error = True
            break

    if error:
        db.session.rollback()
        secho("Names upgrade failed.", fg="red")
        sys.exit(1)
    else:
        db.session.commit()
        secho("Names upgrade succeeded.", fg="green")


def run_upgrade_for_event_stats_mappings():
    """Update the live event stats mappings to add missing fields."""
    secho("Event stats mappings upgrade has started.", fg="green")

    # Find the latest mappings for views and download stats events
    for event_type in ("record-view", "file-download"):
        try:
            events_index = prefix_index(f"events-stats-{event_type}-*")
            res = search_client.indices.get(events_index)
            last_two_indices = sorted(res.keys())[-2:]
            for index in last_two_indices:
                res = search_client.indices.put_mapping(
                    index=index,
                    body={"properties": {"is_machine": {"type": "boolean"}}},
                )
        except Exception as e:
            secho(f"Mapping update for {event_type} failed with '{repr(e)}'.", fg="red")
            trace = traceback.format_exc()
            secho(f"Traceback {trace}", fg="red")
    secho("Event stats mappings upgrade succeeded.", fg="green")


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 12.0 to 13.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!

    NOTE:
    since the data upgrade steps are more selective now, the approach how to do
    it has been changed. now the records/drafts which should be updated are
    searched by a filter and then the updates are applied to those
    records/drafts explicitly. this should improve speed and should make it
    easier to upgrade large instances

    """
    secho("Starting data migration...", fg="green")

    run_upgrade_for_thesis()
    run_upgrade_for_affiliations()
    run_upgrade_for_names()
    run_upgrade_for_event_stats_mappings()


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
