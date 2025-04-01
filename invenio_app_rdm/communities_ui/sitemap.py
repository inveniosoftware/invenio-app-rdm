# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Community sitemap content."""

from invenio_base import invenio_url_for
from invenio_communities.proxies import current_communities
from invenio_search.api import RecordsSearchV2
from invenio_sitemap import SitemapSection, format_to_w3c


class SitemapSectionOfCommunities(SitemapSection):
    """Defines the Sitemap entries for Communities."""

    def iter_entities(self):
        """Iterate over objects."""
        communities_scan = (
            RecordsSearchV2(index=current_communities.service.record_cls.index._name)
            .filter("term", **{"access.visibility": "public"})
            .filter("term", deletion_status="P")
            .sort("-updated")
            # Using preserve_order is fine.
            # Using Point in Time is a recommended alternative but not
            # particularly better than this one for our needs. See
            # https://opensearch.org/docs/latest/search-plugins/searching-data/point-in-time/
            .params(preserve_order=True)
            # In keeping with original: only page is looked for
            # (curation policy is not most relevant)
            .source(["slug", "updated", "metadata.page"])
            .scan()
        )

        for community in communities_scan:
            yield {
                "slug": community.slug,
                "updated": community.updated,
                "loc": invenio_url_for(
                    "invenio_app_rdm_communities.communities_detail",
                    pid_value=community.slug,
                ),
            }

            if "page" in community.get("metadata", {}):
                yield {
                    "slug": community.slug,
                    "updated": community.updated,
                    "loc": invenio_url_for(
                        "invenio_communities.communities_about",
                        pid_value=community.slug,
                    ),
                }

    def to_dict(self, entity):
        """To dict used in sitemap."""
        return {
            "loc": entity["loc"],
            "lastmod": format_to_w3c(entity["updated"]),
        }
