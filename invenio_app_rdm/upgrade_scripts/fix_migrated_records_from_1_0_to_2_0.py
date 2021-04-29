# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.
"""Record migration fix script from InvenioRDM 1.0 to 2.0."""

from invenio_db import db
from invenio_rdm_records.records.api import RDMRecord


def execute_upgrade_fix():
    """Execute the upgrade fix from InvenioRDM 1.0 to 2.0."""

    def update_siblings_versions(records_list):
        """Update records to assign a correct index."""
        def get_created_date(record):
            """Returns created date of the record."""
            return record.created

        records_list.sort(key=get_created_date)
        for index, record in enumerate(records_list):
            record.model.index = index + 1
            record.commit()
        records_list[-1].versions.set_latest()
        records_list[-1].commit()

    for rec_meta in RDMRecord.model_cls.query.all():
        rec = RDMRecord(rec_meta.data, model=rec_meta)
        if not rec.versions.latest_index:
            # If record was upgraded but no new version was created
            rec.versions.set_latest()
            rec.commit()
        elif rec.parent is not None:
            # If record was upgraded and new versions were created
            previous_indexes = []
            siblings_records = RDMRecord.get_records_by_parent(rec.parent)
            for child in siblings_records:
                if child.versions.index in previous_indexes:
                    update_siblings_versions(siblings_records)
                    break
                previous_indexes.append(child.versions.index)

    db.session.commit()


if __name__ == "__main__":
    execute_upgrade_fix()
