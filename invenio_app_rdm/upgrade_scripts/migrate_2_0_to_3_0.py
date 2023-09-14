# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
# Copyright (C) 2021 Northwestern University.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 2.0 to 3.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 2.0 to 3.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from invenio_db import db
from invenio_rdm_records.records.api import RDMDraft, RDMParent, RDMRecord
from invenio_rdm_records.records.models import (
    RDMDraftMetadata,
    RDMFileDraftMetadata,
    RDMRecordMetadata,
)


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 2.0 to 3.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """
    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)

        # Updating to new $schema when eventually saved
        record.pop("$schema", None)

        # Adding empty pids
        if record.pids is None:
            record.pids = {}

        record.commit()

    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)

        # Updating to new $schema when eventually saved
        draft.pop("$schema", None)

        # Adding empty pids
        if draft.pids is None:
            draft.pids = {}

        draft.commit()

    for parent_metadata in RDMParent.model_cls.query.all():
        parent = RDMParent(parent_metadata.data, model=parent_metadata)

        # Updating to new $schema when eventually saved
        parent.pop("$schema", None)

        parent.commit()

    # Cleanup associated deleted drafts.

    drafts = RDMDraftMetadata.query.filter(
        RDMDraftMetadata.is_deleted == True  # noqa
    ).all()  # noqa
    for d in drafts:
        # Delete all file draft records
        RDMFileDraftMetadata.query.filter_by(record_id=d.id).delete()

        # Bucket deletion
        bucket = d.bucket
        d.bucket = None
        d.bucket_id = None

        # Object and bucket not be removed if it's also associated with the
        # record.
        r = RDMRecordMetadata.query.filter_by(id=d.id).one_or_none()
        if r is None or r.bucket_id != bucket.id:
            bucket.remove()

    db.session.commit()


if __name__ == "__main__":
    execute_upgrade()
