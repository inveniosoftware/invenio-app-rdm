# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2024 Graz University of Technology.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 11.0 to 12.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 11.0 to 12.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!


This script has been tested with following data:

- user
  - demo records of v11
  - demo communities of v11
  - cli created user of v11
  - ui created community (com_a)
  - ui created community private (com_b)
  - ui created record (rec_a.v1)
  - ui created v2 of record (rec_a.v1)
  - ui created record (rec_b.v1) added to community (com_a)
  - ui created draft (dra_a)
  - ui created draft (dra_b) added to community (com_b)
  - repository with records without managed doi
  - repository with records with managed doi
  - repository with records with managed doi without parent doi after migration
  - base vocabularies (no customized) usable after migration
  - record (rec_a.v1, rec_a.v2) findable after migration and rebuild of index

- administration
  - user panel list of users visible
  - drafts visible
  - records visible
"""
import sys

from click import secho
from flask import current_app
from invenio_access.permissions import system_identity
from invenio_communities.communities.records.api import Community
from invenio_communities.communities.records.systemfields.access import ReviewPolicyEnum
from invenio_db import db
from invenio_rdm_records.fixtures import PrioritizedVocabulariesFixtures
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.records.api import RDMDraft, RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 11.0 to 12.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def migrate_review_policy(community_record):
        if community_record.is_deleted:
            return

        community_record["access"].setdefault(
            "review_policy", ReviewPolicyEnum.CLOSED.value
        )

    def update_parent(record):
        """Update parent schema and parent communities for older records."""
        new_parent_schema = "local://records/parent-v3.0.0.json"
        record.parent["$schema"] = new_parent_schema

        if (
            isinstance(record.parent["access"]["owned_by"], list)
            and len(record.parent["access"]["owned_by"]) > 0
        ):
            record.parent.access.owned_by = {
                "user": record.parent["access"]["owned_by"][0]["user"]
            }

        if "pids" not in record.parent:
            record.parent["pids"] = {}

            if (
                current_app.config["DATACITE_ENABLED"]
                and "doi" in current_app.config["RDM_PARENT_PERSISTENT_IDENTIFIERS"]
                and current_app.config["RDM_PARENT_PERSISTENT_IDENTIFIERS"]["doi"][
                    "is_enabled"
                ]
            ):
                pids = current_rdm_records.records_service.pids.parent_pid_manager.create_all(
                    record.parent, pids={}, schemes={"doi"}
                )
                current_rdm_records.records_service.pids.parent_pid_manager.reserve_all(
                    record.parent, pids
                )
                record.parent["pids"] = pids
                # Have to commit here otherwise register_or_update won't get
                # the above data
                record.parent.commit()

                if isinstance(record, RDMRecord):
                    current_rdm_records.records_service.pids.register_or_update(
                        id_=record["id"],
                        identity=system_identity,
                        scheme="doi",
                        parent=True,
                    )

    def update_record(record):
        # skipping deleted records because can't be committed
        if record.is_deleted:
            return

        try:
            secho(f"Updating record : {record.pid.pid_value}", fg="yellow")

            # otherwise the save would not work, due to new attributes
            # (media_files, parent_doi) used
            record["$schema"] = "local://records/record-v6.0.0.json"

            # Initialize media files as disabled if not any
            record.setdefault("media_files", {"enabled": False})
            if record.media_files.bucket is None:
                record.media_files.create_bucket()

            update_parent(record)

            record.commit()

            secho(f"> Updated parent: {record.parent.pid.pid_value}", fg="green")
            secho(f"> Updated record: {record.pid.pid_value}\n", fg="green")
            return None
        except Exception as e:
            secho(f"> Error {repr(e)}", fg="red")
            error = f"Record {record.pid.pid_value} failed to update"
            return error

    secho("Starting data migration...", fg="green")

    # upgrading vocabularies
    pvf = PrioritizedVocabulariesFixtures(system_identity)
    pvf.load()

    # Migrating communities
    communities = Community.model_cls.query.all()

    for community_data in communities:
        community = Community(community_data.data, model=community_data)

        # production data could have problems without it
        if community:
            migrate_review_policy(community)
            community.commit()

    # Migrating records and drafts
    errors = []
    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)
        error = update_record(record)

        if error:
            errors.append(error)

    for draft_metadata in RDMDraft.model_cls.query.all():
        draft = RDMDraft(draft_metadata.data, model=draft_metadata)
        error = update_record(draft)
        if error:
            errors.append(error)

    success = not errors

    if success:
        secho("Commiting to DB", nl=True)
        db.session.commit()
        secho(
            "Data migration completed, please rebuild the search indices now.",
            fg="green",
        )

    else:
        secho("Rollback", nl=True)
        db.session.rollback()
        secho(
            "Upgrade aborted due to the following errors:",
            fg="red",
            err=True,
        )

        for error in errors:
            secho(error, fg="red", err=True)

        msg = (
            "The changes have been rolled back. "
            "Please fix the above listed errors and try the upgrade again",
        )
        secho(msg, fg="yellow", err=True)

        sys.exit(1)


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
