# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Static pages."""

from pathlib import Path

from flask import current_app

from .oai_sets import OAICustomSets
from .pages import StaticPages


class Pages:
    """Pages engine."""

    def run(self, force=False):
        """Run the pages loading."""
        dir_ = Path(__file__).parent
        app_data_folder = Path(current_app.instance_path) / "app_data"
        app_pages_folder = app_data_folder / "pages"
        data_folder = dir_ / "data"
        pages_folder = dir_ / "pages"
        StaticPages(
            [app_data_folder, data_folder],
            "pages.yaml",
            [app_pages_folder, pages_folder],
            force,
        ).load()


class FixturesEngine:
    """Basic fixtures engine."""

    def run(self):
        """Run the fixtures loading."""
        dir_ = Path(__file__).parent
        app_data_folder = Path(current_app.instance_path) / "app_data"
        app_pages_folder = app_data_folder / "pages"
        data_folder = dir_ / "data"
        pages_folder = dir_ / "pages"
        OAICustomSets(
            [app_data_folder, data_folder],
            "oai_sets.yaml",
        ).load()

        StaticPages(
            [app_data_folder, data_folder],
            "pages.yaml",
            [app_pages_folder, pages_folder],
            force=True,
        ).load()
