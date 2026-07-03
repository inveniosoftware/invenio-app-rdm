# -*- coding: utf-8 -*-
#
# Copyright (C) 2026 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Role migration script for InvenioRDM 14.0.

Disclaimer: This script is intended to be executed *only once*, for v14
instances where roles may have generated ids different from their names.
It restores the invariant that ``accounts_role.id == accounts_role.name``.
"""

import sys

from click import secho
from invenio_access.models import ActionRoles
from invenio_accounts.models import Role
from invenio_db import db


def execute_upgrade():
    """Execute the role id/name migration."""
    secho("Starting role id/name migration...", fg="green")

    roles = Role.query.filter(Role.id != Role.name).all()

    errors = [
        f"Role <{role.id}> cannot be migrated to <{role.name}>: "
        "target id already exists."
        for role in roles
        if db.session.get(Role, role.name)
    ]

    if errors:
        db.session.rollback()
        secho("Upgrade aborted due to the following errors:", fg="red", err=True)
        for error in errors:
            secho(error, fg="red", err=True)
        sys.exit(1)

    for role in roles:
        old_id = role.id
        new_id = role.name
        users = list(role.users)
        secho(f"Updating role <{old_id}> to <{new_id}>.", fg="yellow")

        # Role.id is referenced by foreign keys without ON UPDATE CASCADE, so
        # replace the row instead of mutating the primary key in place.
        role.name = None
        db.session.flush()

        replacement_role = Role(
            id=new_id,
            name=new_id,
            description=role.description,
            is_managed=role.is_managed,
        )
        replacement_role.users = users
        db.session.add(replacement_role)

        ActionRoles.query.filter_by(role_id=old_id).update(
            {ActionRoles.role_id: new_id}, synchronize_session=False
        )
        db.session.delete(role)

    secho("Committing to DB", fg="green")
    db.session.commit()
    secho(
        f"Data migration completed. Updated {len(roles)} role(s). "
        "Please rebuild the search indices now.",
        fg="green",
    )


if __name__ == "__main__":
    execute_upgrade()
