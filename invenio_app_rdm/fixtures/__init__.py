# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Static pages."""

from pathlib import Path

from invenio_app_rdm.fixtures.oai_sets import OAICustomSets


class FixturesEngine:
    """Basic fixtures engine."""

    def run(self):
        """Run the fixtures loading."""
        dir_ = Path(__file__).parent

        OAICustomSets(
            [Path("./app_data"), dir_ / "data"],
            "oai_sets.yaml",
        ).load()
