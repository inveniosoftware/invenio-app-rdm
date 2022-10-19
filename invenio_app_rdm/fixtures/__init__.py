# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Static pages."""

from pathlib import Path

from invenio_app_rdm.fixtures.pages import StaticPages


class Pages:
    """Pages engine."""

    def run(self, force=False):
        """Run the pages loading."""
        dir_ = Path(__file__).parent

        StaticPages(
            [Path("./app_data"), dir_ / "data"],
            "pages.yaml",
            [Path("./app_data/pages"), dir_ / "pages"],
            force,
        ).load()
