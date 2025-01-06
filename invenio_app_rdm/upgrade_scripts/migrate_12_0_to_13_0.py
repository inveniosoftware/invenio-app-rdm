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

- record
    - internal_notes
"""

import sys

from click import secho
from invenio_db import db
from invenio_rdm_records.records.api import RDMDraft, RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 12.0 to 13.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    THIS MODULE IS WORK IN PROGRESS, UNTIL official v13 release
    """

    def update_record(record):
        # skipping deleted records because can't be committed
        if record.is_deleted:
            return

        try:
            secho(f"Updating record : {record.pid.pid_value}", fg="yellow")

            # TODO: Add any record datamodel migration code here
            record.commit()

            secho(f"> Updated parent: {record.parent.pid.pid_value}", fg="green")
            secho(f"> Updated record: {record.pid.pid_value}\n", fg="green")
            return None
        except Exception as e:
            secho(f"> Error {repr(e)}", fg="red")
            error = f"Record {record.pid.pid_value} failed to update"
            return error

    secho("Starting data migration...", fg="green")

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
