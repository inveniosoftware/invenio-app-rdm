# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 11.0 to 12.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 11.0 to 12.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from click import secho
from invenio_communities.communities.records.api import Community
from invenio_communities.communities.records.systemfields.access import ReviewPolicyEnum
from invenio_db import db
from invenio_rdm_records.records.api import RDMDraft, RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 11.0 to 12.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def migrate_review_policy(community_record):
        review_policy = community_record["access"].get(
            "review_policy", ReviewPolicyEnum.CLOSED.value
        )
        community_record["access"]["review_policy"] = review_policy

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

    def update_record(record):
        # skipping deleted records because can't be committed
        if record.is_deleted:
            return

        try:
            secho(f"Updating record : {record.pid.pid_value}", fg="yellow")

            # Initialize media files as disabled if not any
            record.setdefault("media_files", {"enabled": False})
            if record.media_files.bucket is None:
                record.media_files.create_bucket()

            update_parent(record)

            record.parent.commit()
            record.commit()

            secho(f"> Updated parent: {record.parent.pid.pid_value}", fg="green")
            secho(f"> Updated record: {record.pid.pid_value}\n", fg="green")
            return None
        except Exception as e:
            secho("> Error {}".format(repr(e)), fg="red")
            error = "Record {} failed to update".format(record.pid.pid_value)
            return error

    secho("Starting data migration...", fg="green")

    # Migrating communities
    communities = Community.model_cls.query.all()

    for community_data in communities:
        community = Community(community_data.data, model=community_data)
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
        secho(f"Commiting to DB", nl=True)
        db.session.commit()
        secho(
            "Data migration completed, please rebuild the search indices now.",
            fg="green",
        )

    else:
        secho(f"Rollback", nl=True)
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

    # TODO create parent DOIs? Or warn that new records will have one?


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
