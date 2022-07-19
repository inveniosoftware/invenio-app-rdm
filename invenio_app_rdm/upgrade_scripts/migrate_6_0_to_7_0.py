# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 6.0 to 7.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 6.0 to 7.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

import sys

from click import secho
from invenio_db import db
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.records.api import RDMDraft, RDMRecord
from invenio_records.systemfields.relations.errors import InvalidCheckValue


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 6.0 to 7.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def migrate_records_and_parents(record_cls, check_deleted):
        """Migrate records (and parents) from v6 to v7."""
        success = True
        records = []
        for record_metadata in record_cls.model_cls.query.all():
            # skipping deleted drafts because can't be committed
            if check_deleted and record_metadata.is_deleted:
                continue

            record = record_cls(record_metadata.data, model=record_metadata)

            # migrate the parent record to the new schema, if necessary
            new_schema = "local://records/parent-v2.0.0.json"
            if record.parent["$schema"] != new_schema:
                record.parent["$schema"] = new_schema
                record.parent.commit()

            try:
                record.commit()
                records.append(record)

            except Exception as exc:
                # report errors along the way
                success = False
                pid = record.pid.pid_value

                if isinstance(exc, InvalidCheckValue):
                    # this can happen when when e.g. a record's resource type
                    # is set to something that's not depositable
                    secho(
                        f"{record_cls.__name__} '{pid}' has a problem, likely "
                        "with an invalid 'resource_type' value. "
                        "This should be fixable by changing its metadata "
                        "in a way that it can be saved successfully.",
                        fg="red",
                        err=True,
                    )
                else:
                    secho(
                        f"{record_cls.__name__} '{pid}' needs fixing.",
                        fg="red",
                        err=True,
                    )

                secho(f"> Error message: {exc}\n", fg="red", err=True)

        return records, success

    def create_oai_identifiers(records):
        """Create and reserve OAI identifiers for the records.

        This will create OAI PIDs for the records and their drafts.
        We skip drafts that aren't published, because they'll get their
        OAI PIDs upon publication.
        """
        service = current_rdm_records_service
        pid_manager = service.pids.pid_manager
        for record in records:
            # skip records that already have some kind of OAI PID set
            if "oai" in record.pids:
                secho(
                    f"Skipping record '{record.pid.pid_value}', as there's "
                    f"already an OAI PID registered: {record.pids['oai']}",
                    fg="yellow",
                )
                continue

            # create and set the OAI PID for the record
            oai_pid = pid_manager.create(record, "oai", None)
            record.pids["oai"] = oai_pid
            record.commit()

            # set the OAI PID for the draft as well, if there is one
            try:
                draft = service.draft_cls.pid.resolve(
                    record.pid.pid_value, registered_only=False
                )
                if not draft.is_deleted:
                    draft.pids["oai"] = oai_pid
                    draft.commit()

            except Exception:
                pass

            # reserve the OAI PID
            pid_manager.reserve(
                record, "oai", oai_pid["identifier"], oai_pid["provider"]
            )

    def reindex_records(records):
        """Reindex the given records."""
        for record in records:
            current_rdm_records_service.indexer.index(record)

    success = True

    secho("Migrating records and record parents...")
    records, success1 = migrate_records_and_parents(RDMRecord, False)
    success = success and success1

    secho("Migrating drafts...")
    drafts, success2 = migrate_records_and_parents(RDMDraft, True)
    success = success and success2

    # only finish the migration if there have been no errors
    if success:
        try:
            secho("Creating OAI PIDs for records...")
            create_oai_identifiers(records)
            db.session.commit()

            reindex_records(records)
            reindex_records(drafts)
            secho("Records and drafts migrated.", fg="green")

        except Exception as exc:
            success = False
            secho(f"Error while generating OAI PIDs: {exc}\n", fg="red", err=True)

    if not success:
        secho(
            "Upgrade aborted: There have been problems with the above "
            "mentioned records/drafts - please fix them and try the "
            "migration again!",
            fg="yellow",
            err=True,
        )
        db.session.rollback()


if __name__ == "__main__":
    execute_upgrade()
