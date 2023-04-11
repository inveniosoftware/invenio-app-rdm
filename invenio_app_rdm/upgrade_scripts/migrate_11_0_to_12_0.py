# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 11.0 to 12.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 11.0 to 12.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from click import secho
from invenio_communities.communities.records.api import Community
from invenio_communities.communities.records.systemfields.access import ReviewPolicyEnum
from invenio_db import db


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 11.0 to 12.0.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def migrate_review_policy(community_record):
        review_policy = community_record["access"].get(
            "review_policy", ReviewPolicyEnum.CLOSED.value
        )
        community_record["access"]["review_policy"] = review_policy

    secho("Starting data migration...", fg="green")
    communities = Community.model_cls.query.all()

    for community_data in communities:
        community = Community(community_data.data, model=community_data)
        migrate_review_policy(community)
        community.commit()

    secho(f"Committing to DB", fg="green")
    db.session.commit()
    secho("Data migration completed.", fg="green")


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
