# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDMRecords sitemap content."""

from invenio_base import invenio_url_for
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_search.api import RecordsSearchV2
from invenio_sitemap import SitemapSection, format_to_w3c


class SitemapSectionOfRDMRecords(SitemapSection):
    """Defines the Sitemap entries for Records."""

    def iter_entities(self):
        """Iterate over objects."""
        records_scan = (
            RecordsSearchV2(index=current_rdm_records_service.record_cls.index._name)
            .filter("term", **{"access.record": "public"})
            .filter("term", deletion_status="P")
            .sort("-updated")
            # Using preserve_order is fine.
            # Using Point in Time is a recommended alternative but not
            # particularly better than this one for our needs. See
            # https://opensearch.org/docs/latest/search-plugins/searching-data/point-in-time/
            .params(preserve_order=True)
            .source(["id", "updated"])
            .scan()
        )
        return records_scan

    def to_dict(self, entity):
        """To dict used in sitemap."""
        return {
            "loc": invenio_url_for(
                "invenio_app_rdm_records.record_detail", pid_value=entity["id"]
            ),
            "lastmod": format_to_w3c(entity["updated"]),
        }
