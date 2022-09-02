# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
# Copyright (C) 2022 TU Wien.
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration fix script from InvenioRDM 8.0 to 9.0."""

from click import secho
from invenio_db import db
from invenio_rdm_records.records.api import RDMDraft, RDMRecord


def execute_upgrade_fix():
    """Execute the upgrade fix from InvenioRDM 8.0 to 9.0."""

    def update_parent(record):
        """Update parent schema and parent communities for older records."""
        new_parent_schema = "local://records/parent-v2.0.0.json"
        record.parent["$schema"] = new_parent_schema
        record.parent.setdefault("communities", {})

    def update_record(record):
        # skipping deleted records because can't be committed
        if record.is_deleted:
            return

        try:
            secho(f"Updating record : {record.pid.pid_value}", fg="yellow")

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


if __name__ == "__main__":
    execute_upgrade_fix()
