# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-2024 CERN.
# Copyright (C) 2025 University of Münster.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Static pages."""

from pathlib import Path

from flask import current_app
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_i18n.proxies import current_i18n
from invenio_pages.proxies import current_pages_service
from invenio_pages.records.errors import PageNotFoundError
from invenio_rdm_records.fixtures.fixture import FixtureMixin


class StaticPages(FixtureMixin):
    """Static pages."""

    def __init__(self, search_paths, filename, pages_path, force=False):
        """Initialize the fixture."""
        super().__init__(search_paths, filename)
        self._force = force
        self._pages_path = pages_path
        self._supported_languages = current_i18n.get_languages()

    def load(self):
        """Load the static pages."""
        if self._force:
            current_pages_service.delete_all(system_identity)

        super().load()
        db.session.commit()

    def page_data(self, page, lang):
        """Returns content of template."""
        for path in self._pages_path:
            filepath = Path(str(path / page) + "." + lang)

            if not filepath.exists():
                filepath = path / page

                if not filepath.exists():
                    continue

            return Path(filepath).read_bytes().decode("utf8")

    def create(self, entry):
        """Load a single page."""
        url = entry["url"]
        for lang in self._supported_languages:
            try:
                current_pages_service.read_by_url(system_identity, url, lang[0])
            except PageNotFoundError:
                data = {
                    "url": url,
                    "title": entry.get("title", ""),
                    # content is optional as it can be added later from the administration panel
                    "content": (
                        self.page_data(entry["template"], lang[0])
                        if entry.get("template")
                        else ""
                    ),
                    "lang": lang[0],
                    "description": entry.get("description", ""),
                    "template_name": current_app.config["PAGES_DEFAULT_TEMPLATE"],
                }
                current_pages_service.create(system_identity, data)
