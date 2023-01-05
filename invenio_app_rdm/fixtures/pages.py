# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Static pages."""
from pathlib import Path

from flask import current_app
from invenio_db import db
from invenio_pages import Page
from invenio_rdm_records.fixtures.fixture import FixtureMixin


class StaticPages(FixtureMixin):
    """Static pages."""

    def __init__(self, search_paths, filename, pages_path, force=False):
        """Initialize the fixture."""
        super().__init__(search_paths, filename)
        self._force = force
        self._pages_path = pages_path

    def load(self):
        """Load the static pages."""
        if self._force:
            Page.query.delete()

        super().load()
        db.session.commit()

    def page_data(self, page):
        """Returns content of template."""
        for path in self._pages_path:
            filepath = path / page

            if not filepath.exists():
                continue

            return Path(filepath).read_bytes().decode("utf8")

    def create(self, entry):
        """Load a single page."""
        db.session.add(
            Page(
                url=entry.pop("url"),
                title=entry.get("title"),
                description=entry.get("description"),
                content=self.page_data(entry.get("template")),
                template_name=current_app.config["PAGES_DEFAULT_TEMPLATE"],
            )
        )
