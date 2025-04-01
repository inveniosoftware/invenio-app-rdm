# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 Northwestern University.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test sitemaps."""

import datetime

import time_machine
from invenio_communities.proxies import current_communities

from invenio_app_rdm.communities_ui.sitemap import SitemapSectionOfCommunities
from invenio_app_rdm.records_ui.sitemap import SitemapSectionOfRDMRecords


def test_sitemap_section_of_communities(running_app, community_input, create_community):
    # by default converted to UTC w/ time 00:00:00
    with time_machine.travel(datetime.date(2025, 3, 27)):
        community_input["slug"] = "my-test-community-1"
        c1 = create_community(data=community_input)
        community_input["slug"] = "my-test-community-2"
        community_input["access"]["visibility"] = "restricted"
        c2 = create_community(data=community_input)
    with time_machine.travel(datetime.date(2025, 3, 28)):
        community_input["slug"] = "my-test-community-3"
        community_input["access"]["visibility"] = "public"
        community_input["metadata"]["page"] = "A page to be indexed."
        c3 = create_community(data=community_input)

    current_communities.service.indexer.refresh()  # index in search engine
    section = SitemapSectionOfCommunities()

    entries = [section.to_dict(entity) for entity in section.iter_entities()]

    expected_entries = [
        {
            "loc": "https://127.0.0.1:5000/communities/my-test-community-3/records",
            "lastmod": "2025-03-28T00:00:00Z",
        },
        {
            "loc": "https://127.0.0.1:5000/communities/my-test-community-3/about",
            "lastmod": "2025-03-28T00:00:00Z",
        },
        {
            "loc": "https://127.0.0.1:5000/communities/my-test-community-1/records",
            "lastmod": "2025-03-27T00:00:00Z",
        },
    ]
    assert expected_entries == entries


def test_sitemap_section_of_records(
    running_app, minimal_record, create_record, records_service
):
    # by default converted to UTC w/ time 00:00:00
    with time_machine.travel(datetime.date(2025, 3, 27)):
        minimal_record["title"] = "my-test-record-1"
        r1 = create_record(data=minimal_record)
        minimal_record["title"] = "my-test-record-2"
        minimal_record["access"]["record"] = "restricted"
        r2 = create_record(data=minimal_record)
    with time_machine.travel(datetime.date(2025, 3, 28)):
        minimal_record["title"] = "my-test-record-3"
        minimal_record["access"]["record"] = "public"
        r3 = create_record(data=minimal_record)

    records_service.indexer.refresh()
    section = SitemapSectionOfRDMRecords()

    entries = [section.to_dict(entity) for entity in section.iter_entities()]

    expected_entries = [
        {
            "loc": f"https://127.0.0.1:5000/records/{r3.id}",
            "lastmod": "2025-03-28T00:00:00Z",
        },
        {
            "loc": f"https://127.0.0.1:5000/records/{r1.id}",
            "lastmod": "2025-03-27T00:00:00Z",
        },
    ]
    assert expected_entries == entries
