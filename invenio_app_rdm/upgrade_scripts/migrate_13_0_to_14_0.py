# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2026 Graz University of Technology.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 13.0 to 14.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 13.0 to 14.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!


This script has been tested for the following scenarios:
1. Draft with resource type publication-thesis
2. Record with resource type publication-thesis with a DOI and no draft
3. Record with resource type publication-thesis with a no DOI and an existing draft
4. Records with multiple versions

5. Update requests to make it ready for the commenting feature
"""

from click import secho


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 13.0 to 14.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    THIS MODULE IS WORK IN PROGRESS, UNTIL official v14 release

    NOTE:
    since the data upgrade steps are more selective now, the approach how to do
    it has been changed. now the records/drafts which should be updated are
    searched by a filter and then the updates are applied to those
    records/drafts explicitly. this should improve speed and should make it
    easier to upgrade large instances

    """
    secho("No metadata migration for v14", fg="green")


# if the script is executed on its own, perform the upgrade
if __name__ == "__main__":
    execute_upgrade()
