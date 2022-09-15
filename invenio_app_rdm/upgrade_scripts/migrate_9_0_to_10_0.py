# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 9.0 to 10.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 9.0 to 10.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from click import echo, secho
from invenio_db import db
from invenio_oaiserver.models import OAISet


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 9.0 to 10.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """
    system_created_sets = OAISet.query.filter(OAISet.spec.like("community-%")).all()

    for system_created_set in system_created_sets:
        echo(f"Updating record: {system_created_set.id}... ", nl=True)
        system_created_set.system_created = True

    echo(f"Commiting to DB", nl=True)
    db.session.commit()
    secho(
        "Data migration completed.",
        fg="green",
    )


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
