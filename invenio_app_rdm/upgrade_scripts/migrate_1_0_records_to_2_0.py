# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 TU Wien.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.
"""Record migration script from InvenioRDM 1.0 to 2.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 1.0 to 2.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from invenio_rdm_records.records.api import RDMDraft, RDMParent, RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 1.0 to 2.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """
    parents_by_recid = {}

    def get_or_create_parent(recid_value, pid_dict, access_dict):
        """Execute the upgrade from InvenioRDM 1.0 to 2.0."""
        if recid_value in parents_by_recid:
            return parents_by_recid[recid_value]

        # the parents' PIDs should already exist, and this seems to be a
        # feasible way to make the parent reference them
        parent = RDMParent.create(
            {
                "id": recid_value,
                "pid": pid_dict,
                "access": access_dict,
            }
        )
        parent.commit()

        # have the PID point back to the parent record
        pid = PersistentIdentifier.query.filter_by(id=pid_dict["pk"]).one()
        pid.object_uuid = parent.id

        parents_by_recid[recid_value] = parent

        return parent

    for rec_meta in RDMRecord.model_cls.query.all():
        rec = RDMRecord(rec_meta.data, model=rec_meta)
        if rec.parent is None:
            rec.pop("$schema")

            # the access field was partially moved to the parent
            parent_access = rec["access"].copy()
            parent_access.pop("record", None)
            parent_access.pop("files", None)
            parent_access.pop("embargo", None)

            parent = get_or_create_parent(
                rec.pop("conceptid"), rec.pop("conceptpid"), parent_access
            )
            rec.parent = parent

            # versions housekeeping
            rec.model.index = 1
            rec.versions.set_latest()
            rec.commit()

            assert rec.parent["id"] == parent["id"]

    for draft_meta in RDMDraft.model_cls.query.all():
        draft = RDMRecord(draft_meta.data, model=draft_meta)
        if dict(draft) and draft.parent is None:
            draft.pop("$schema")
            parent_access = draft["access"].copy()
            parent_access.pop("record", None)
            parent_access.pop("files", None)
            parent_access.pop("embargo", None)

            parent = get_or_create_parent(
                draft.pop("conceptid"), draft.pop("conceptpid"), parent_access
            )
            draft.parent = parent

            # versions housekeeping
            draft.model.index = 1
            if not draft.is_published:
                draft.versions.set_next()

            draft.commit()
            assert draft.parent["id"] == parent["id"]

    db.session.commit()


if __name__ == "__main__":
    execute_upgrade()
