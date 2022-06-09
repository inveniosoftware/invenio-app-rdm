# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 7.0 to 8.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 7.0 to 8.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from pathlib import Path

import invenio_rdm_records.fixtures as fixtures
from click import echo, secho
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_rdm_records.fixtures import (
    PrioritizedVocabulariesFixtures,
    VocabulariesFixture,
)
from invenio_vocabularies.proxies import current_service as vocabulary_svc


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 7.0 to 8.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def update_license(license_dict):
        """Update the stored vocabulary with the new icon."""
        try:
            echo(f"Updating license: {license_dict['id']}... ", nl=False)
            license_ = vocabulary_svc.read(
                system_identity, ("licenses", license_dict["id"])
            )._obj

            # NOTE: we don't use the service update method here because we
            # want to evade validation errors, and the migration guide tells
            # the users to completely rebuild the search indices anyway
            # and we pop the '$schema' because it might be outdated and is
            # a constant field anyway
            license_["icon"] = license_dict["icon"]
            license_.pop("$schema", None)
            license_.commit()
            secho("OK", fg="green")

        except Exception as e:
            secho("Error", fg="red")
            return f"Error updating license '{license_dict['id']}': {e}"

        return None

    def update_licenses_from_fixture(fixture):
        """Use the given fixture to update the license vocabularies."""
        errors = []
        did_load_licenses = False

        for id_, entry in fixture.read():
            if id_ == "licenses":
                for license_dict in entry.iterate(ignore=[]):
                    did_load_licenses = True
                    error = update_license(license_dict)
                    if error:
                        errors.append(error)

        return did_load_licenses, errors

    # let the prioritized vocabularies fixture take care of the
    # path building and entrypoint definition, etc.
    dir_ = Path(fixtures.__file__).parent
    pf = PrioritizedVocabulariesFixtures(
        system_identity,
        app_data_folder=Path("./app_data"),
        pkg_data_folder=(dir_ / "data"),
        filename="vocabularies.yaml",
    )

    errors = []
    licenses_loaded = False

    # we're checking the same places as the prioritized vocabularies fixtures,
    # and in the same order
    # 1: check the app_data directory for the invenio instance
    app_data_yaml_file = pf._app_data_folder / pf._filename
    if app_data_yaml_file.exists():
        app_data_fixture = VocabulariesFixture(system_identity, app_data_yaml_file)
        licenses_loaded, errs = update_licenses_from_fixture(app_data_fixture)
        errors.extend(errs)

    # 2: check the entry points
    extensions = [ep.load() for ep in pf._entry_points()]
    for module in extensions:
        directory = Path(module.__file__).parent
        filepath = directory / pf._filename
        vocab_list = pf.peek_vocabularies(filepath)

        # check if the entry points define something for licenses
        if not licenses_loaded and "licenses" in vocab_list:
            extension_fixture = VocabulariesFixture(system_identity, filepath)
            licenses_loaded, errs = update_licenses_from_fixture(extension_fixture)
            errors.extend(errs)

    # 3: check the default vocabularies from rdm-records
    pkg_data_yaml_file = pf._pkg_data_folder / pf._filename
    if not licenses_loaded and pkg_data_yaml_file.exists():
        pkg_data_fixture = VocabulariesFixture(system_identity, pkg_data_yaml_file)
        licenses_loaded, errs = update_licenses_from_fixture(pkg_data_fixture)
        errors.extend(errs)

    success = not errors

    # give feedback on the operation
    if not licenses_loaded:
        secho(
            "Warning: No licenses were upgraded, which is unexpected.",
            fg="yellow",
        )

    if success:
        db.session.commit()
        secho(
            "Data migration completed, please rebuild the search indices now.",
            fg="green",
        )

    else:
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
