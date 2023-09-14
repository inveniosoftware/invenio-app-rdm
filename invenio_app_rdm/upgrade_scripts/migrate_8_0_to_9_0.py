# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 8.0 to 9.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 8.0 to 9.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from click import echo, secho
from invenio_db import db
from invenio_rdm_records.records.api import RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 8.0 to 9.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def update_funding_field(record):
        try:
            echo(f"Updating record: {record['id']}... ", nl=False)
            for funding in record.metadata.get("funding", []):
                award = funding.get("award", {})
                funder = funding.get("funder", {})
                if award.get("identifier") and award.get("scheme"):
                    award_identifier = award.pop("identifier")
                    award_scheme = award.pop("scheme")
                    funding["award"]["identifiers"] = [
                        {"identifier": award_identifier, "scheme": award_scheme}
                    ]
                if funder.get("identifier") and funder.get("scheme"):
                    funder.pop("identifier")
                    funder.pop("scheme")
                if award.get("title", ""):
                    award_title = award.pop("title")
                    funding["award"]["title"] = {"en": award_title}
                if funder.get("title", ""):
                    funder.pop("title")
            secho("OK", fg="green")
            return record
        except Exception as e:
            secho("Error {}".format(repr(e)), fg="red")
            return None

    errors = []

    records = RDMRecord.model_cls.query.all()
    for record in records:
        r = RDMRecord(record.data, model=record)
        r["$schema"] = "local://records/record-v5.0.0.json"
        res = update_funding_field(r)
        if res is None:
            errors.append("Record {} failed to update funding".format(r.id))
        else:
            r = res
            r.commit()

    success = not errors

    if success:
        echo("Committing to DB", nl=True)
        db.session.commit()
        secho(
            "Data migration completed, please rebuild the search indices now.",
            fg="green",
        )

    else:
        echo("Rollback", nl=True)
        db.session.rollback()
        secho(
            "Upgrade aborted due to the following errors:",
            fg="red",
            err=True,
        )

        for error in errors:
            secho(error, fg="red", err=True)

        msg = (
            "The changes have been rolled back. "
            "Please fix the above listed errors and try the upgrade again",
        )
        secho(msg, fg="yellow", err=True)


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
