# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 10.0 to 11.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 10.0 to 11.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from click import secho
from invenio_db import db
from invenio_files_rest.models import Bucket, FileInstance


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 10.0 to 11.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """
    secho("Starting data migration...", fg="green")
    buckets = Bucket.query.all()

    for bucket in buckets:
        bucket.default_storage_class = "L"
    db.session.add(bucket)

    file_instances = FileInstance.query.all()

    for fi in file_instances:
        fi.storage_class = "L"
        db.session.add(fi)

    secho("Committing to DB", fg="green")
    db.session.commit()
    secho("Data migration completed.", fg="green")


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
