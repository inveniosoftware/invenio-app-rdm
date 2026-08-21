# SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
# SPDX-FileCopyrightText: 2026 Northwestern University.
# SPDX-License-Identifier: MIT

"""Role migration script for InvenioRDM 14.0.

Disclaimer: This script is intended to be executed *only once*, for v14
instances where roles may have generated ids different from their names.
It restores the invariant that ``accounts_role.id == accounts_role.name``.
"""

import sys

from click import secho
from invenio_access.models import ActionRoles
from invenio_accounts.models import Role, userrole
from invenio_communities.members import MemberModel
from invenio_db import db
from sqlalchemy import update


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
        secho(f"Updating role id <{old_id}> to <{new_id}>.", fg="yellow")

        # Role.id is referenced by foreign keys without ON UPDATE CASCADE, and
        # we can't alter a persisted role's name directly because of
        # https://github.com/inveniosoftware/invenio-accounts/blob/master/invenio_accounts/models.py#L128  # noqa
        # . So idea is to create a new Role, make related entities point to it,
        # and delete old Role afterwards. And do it all using "low-level"
        # SQL primitives that avoid the application-level constraints.

        db.session.execute(update(Role).where(Role.id == old_id).values(name=None))

        # Create new Role with id == name
        replacement_role = Role(
            id=new_id,
            name=new_id,
            description=role.description,
            is_managed=role.is_managed,
        )
        db.session.add(replacement_role)
        db.session.flush()

        # Change access_actionroles to use new entry
        db.session.execute(
            update(ActionRoles)
            .where(ActionRoles.role_id == old_id)
            .values(role_id=replacement_role.id)
        )

        # Change accounts_userrole to use new entry
        # fmt: off
        db.session.execute(
            update(userrole)
            # Note 'c' because userrole is a Table and not a Model
            .where(userrole.c.role_id == old_id)
            .values(role_id=replacement_role.id)
        )
        # fmt: on

        # Change communities_members to use new entry
        db.session.execute(
            update(MemberModel)
            .where(MemberModel.group_id == old_id)
            .values(group_id=replacement_role.id)
        )

        # Can skip archived invitations (cannot invite group)

        # Delete old role
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
