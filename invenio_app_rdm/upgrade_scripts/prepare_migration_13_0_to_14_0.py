# SPDX-FileCopyrightText: 2026 CESNET z.s.p.o.
# SPDX-License-Identifier: MIT

"""
Clean up v13 alembic table, prepare the database for v14 migration.

Note: invenio-webhooks is an optional package that is not installed by default
If the cleanup process finds the package installed, it will add the head to the alembic table
and keep the webhooks tables intact. If the package is not installed, the webhooks tables
will be dropped and the head will be removed from the alembic table.
"""

import importlib.metadata
import sys

from invenio_db import db
from sqlalchemy import inspect, text

from invenio_app_rdm import __version__ as app_rdm_version

app_rdm_major_version = app_rdm_version.split(".", 1)[0]


def _is_installed(distribution_name):
    """Return True if the given distribution is installed."""
    try:
        importlib.metadata.distribution(distribution_name)
        return True
    except importlib.metadata.PackageNotFoundError:
        return False


def check_prerequisites(connection, record_failure):
    """Check that the prerequisites for the migration are met."""
    if app_rdm_major_version not in ("13", "14"):
        record_failure(
            f"This migration script is not compatible with RDM {app_rdm_major_version}, only RDM 13 and 14 are supported.",
        )

    result = connection.execute(text("SELECT * FROM alembic_version"))
    revision_ids = [row.version_num for row in result]

    if "6ec5ce377ca3" not in revision_ids and "23e196599f9f" not in revision_ids:
        record_failure(
            "The 6ec5ce377ca3 (RDM13) nor 23e196599f9f (RDM14) migration is not present in the invenio_accounts branch. The migration process might fail."
        )

    if "72b37bb4119c" not in revision_ids and "dfbc96c5211f" not in revision_ids:
        record_failure(
            "The 72b37bb4119c (RDM13) nor dfbc96c5211f (RDM14) migration is not present in the invenio_communities branch. The migration process might fail."
        )


def table_exist(connection, table_name):
    """Check if the given table exists in the database."""
    return inspect(connection).has_table(table_name)


def column_exists(connection, table_name, column_name):
    """Check if the given column exists on the given table."""
    if not table_exist(connection, table_name):
        return False
    return any(
        column["name"] == column_name
        for column in inspect(connection).get_columns(table_name)
    )


def add_head_if_package_installed(connection, package_name, head, require_tables=None):
    """Add the given head to the alembic table if not already present."""
    if not _is_installed(package_name):
        print(f"Package {package_name} not found, skipping head {head}")
        return

    if require_tables and not all(
        table_exist(connection, table_name) for table_name in require_tables
    ):
        print(
            f"Package {package_name} found, but some tables are missing, "
            f"skipping setting head {head}."
        )
        return

    print(f"Package {package_name} found, adding its migration head {head}")
    connection.execute(
        text(
            "INSERT INTO alembic_version (version_num) "
            "SELECT :version_num "
            "WHERE NOT EXISTS ("
            "  SELECT 1 FROM alembic_version WHERE version_num = :version_num"
            ")"
        ),
        {"version_num": head},
    )


def remove_head_if_package_not_installed(connection, package_name, head):
    """Remove the given head from the alembic table."""
    if not _is_installed(package_name):
        print(f"Package {package_name} not found, removing head {head}")
        connection.execute(
            text("DELETE FROM alembic_version WHERE version_num = :version_num"),
            {"version_num": head},
        )
    else:
        print(f"Package {package_name} found, keeping head {head}")


def fix_invenio_access(connection):
    """Fix the alembic table for invenio-access."""
    add_head_if_package_installed(connection, "invenio-access", "f9843093f686")


def remove_table_if_package_not_installed(connection, package_name, table_name):
    """Remove the given table if the package is not installed."""
    if not _is_installed(package_name):
        print(f"Package {package_name} not found, removing table {table_name}")
        connection.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
    else:
        print(f"Package {package_name} found, keeping table {table_name}")


def fix_invenio_github(connection):
    """Fix the alembic table for invenio-github.

    invenio-github package has been replaced by a more generic invenio-vcs
    so we remove the github tables from the database
    """
    remove_table_if_package_not_installed(
        connection, "invenio-github", "github_releases"
    )
    remove_table_if_package_not_installed(
        connection, "invenio-github", "github_repositories"
    )
    remove_head_if_package_not_installed(connection, "invenio-github", "b0eaee37b545")


def fix_invenio_webhooks(connection):
    """Fix the database for invenio-webhooks package.

    * Remove the webhooks_events table if the package is not installed.
    * Add the alembic head for webhooks if the package is installed and
      we are upgrading from v13 to v14 (that is, we still have invenio-github package).
    """
    remove_table_if_package_not_installed(
        connection, "invenio-webhooks", "webhooks_events"
    )

    # add extra head for webhooks if the invenio-webhooks package is installed
    # and github package was installed -> github package swallowed webhooks branch
    # and will be removed, so we need to create that branch
    add_head_if_package_installed(
        connection,
        "invenio-webhooks",
        "a095bd179f5c",
        require_tables=["webhooks_events", "github_releases"],
    )


def remove_obsolete_files_index(connection):
    """Remove the obsolete ix_uq_partial_files_object_is_head index."""
    # this index has been removed some time ago but keeps popping up
    # see: https://github.com/search?q=org%3Ainveniosoftware+ix_uq_partial_files_object_is_head&type=code
    connection.execute(text("DROP INDEX IF EXISTS ix_uq_partial_files_object_is_head"))


def remove_user_id_from_transaction(connection):
    """Remove the user_id column from transaction table.

    Repositories generated later than 5 years ago already do not have this column, older repositories
    might have. We drop it to avoid schema conflicts between the model and the database only if it does
    not contain values.

    ALEMBIC_DIFF_COUNT:3
    - ('remove_index', Index('ix_transaction_user_id', Column('user_id', INTEGER(), table=<transaction>)))
    - ('remove_fk',
       ForeignKeyConstraint(<sqlalchemy.sql.base.ReadOnlyColumnCollection object at 0x1162cae30>, None, name='fk_transaction_user_id_accounts_user', table=Table('transaction', MetaData(), Column('user_id', NullType(), ForeignKey('accounts_user.id'), table=<transaction>), schema=None)))
    - ('remove_column',
       None,
       'transaction',
       Column('user_id', INTEGER(), ForeignKey('accounts_user.id'), ForeignKey('accounts_user.id'), table=<transaction>))
    """
    print("Checking whether the transaction table should be migrated...")
    if not column_exists(connection, "transaction", "user_id"):
        print("The transaction table has no user_id column, nothing to do.")
        return

    result = connection.execute(
        text("select count(1) from transaction where user_id is not null")
    )
    if result.fetchone()[0] > 0:
        print(
            "The transaction.user_id column contains non-null values, keeping it. "
            "The database will remain inconsistent (but working) with the invenio-db "
            "model until this is resolved manually. Please contact the Invenio team "
            "on Discord for help.",
            file=sys.stderr,
        )
    else:
        print("Dropping the empty transaction.user_id column")
        connection.execute(text("ALTER TABLE transaction DROP COLUMN user_id CASCADE"))


def fix_system_created_server_default(connection):
    """Add the missing server_default to oaiserver_set.system_created.

    invenio-oaiserver's migration that adds this column has always set
    server_default=false, but the SQLAlchemy model didn't set one until it was fixed in
    https://github.com/inveniosoftware/invenio-oaiserver/commit/d2faa0d780a6cbcdf1e9fea4375e75176a68863e.
    Instances that got the column via `db create` (built from the model, before that fix)
    are missing the server default. We backfill it here with the column's own default
    value, so it's safe to apply regardless of when the repository was created.

    ALEMBIC_DIFF_COUNT:1
    - ('modify_default', None, 'oaiserver_set', 'system_created', {'existing_nullable': False, 'existing_type': BOOLEAN()}, None, Column('system_created', Boolean(), table=<oaiserver_set>, server_default=DefaultClause(<sqlalchemy.sql.elements.ColumnClause object at 0x1162cae30>, for_update=False)))
    """
    if not column_exists(connection, "oaiserver_set", "system_created"):
        print("The oaiserver_set table has no system_created column, nothing to do.")
        return

    print("Setting the server default for oaiserver_set.system_created")
    connection.execute(
        text("ALTER TABLE oaiserver_set ALTER COLUMN system_created SET DEFAULT false")
    )


class FailureReporter:
    """Report failures during the upgrade process."""

    def __init__(self):
        """Initialize the failure reporter."""
        self.failed = False

    def __call__(self, message):
        """Mark the reporter as failed and print the message to stderr."""
        self.failed = True
        print(message, file=sys.stderr)


if __name__ == "__main__":
    with db.engine.connect() as connection:
        with connection.begin():
            reporter = FailureReporter()
            check_prerequisites(connection, reporter)
            if reporter.failed:
                if len(sys.argv) < 2 or sys.argv[1] != "--force":
                    raise Exception(
                        "There were errors during the prerequisites check. Run with --force to ignore them.",
                    )
            fix_invenio_access(connection)
            fix_invenio_webhooks(connection)
            fix_invenio_github(connection)
            remove_obsolete_files_index(connection)
            remove_user_id_from_transaction(connection)
            fix_system_created_server_default(connection)
            connection.commit()

    # fmt: off
    print("""
    v13 -> v14 database cleanup completed successfully.

    Please run:

        invenio alembic upgrade heads

    to finish the database structure migration process. Then continue with the data migration script.
    """)
    # fmt: on
