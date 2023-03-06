# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test the statistics integration."""

import time
from datetime import datetime, timedelta

import pytest
from flask import current_app
from invenio_search.engine import dsl
from invenio_stats.proxies import current_stats
from invenio_stats.tasks import process_events


@pytest.fixture()
def empty_event_queues(running_app):
    """Make sure the event queues exist and are empty."""
    for event in current_stats.events:
        queue = current_stats.events[event].queue
        queue.queue.declare()
        queue.consume()


def test_record_view_events(
    client, running_app, index_templates, record, empty_event_queues
):
    """Test that landing page visits trigger events."""
    res = client.get(f"/records/{record.id}")
    assert res.status_code == 200

    # as per current default configuration, only UI-based visits should
    # trigger events to be sent off to the queue
    # (API calls such as the CSL export on the landing page are ignored)
    queue = current_stats.events["record-view"].queue
    events = list(queue.consume())
    event = events[0]
    assert len(events) == 1
    assert event["recid"] == record.id
    assert event["via_api"] is False


def test_record_view_statistics(
    client, running_app, index_templates, record, empty_event_queues
):
    """Test that landing page visits triggers events and indexes them."""
    event_cfg = current_stats.events["record-view"]
    event = event_cfg.cls(**event_cfg.params, double_click_window=0)
    agg_cfg = current_stats.aggregations["record-view-agg"]
    agg = agg_cfg.cls(agg_cfg.name, **agg_cfg.params)
    query_cfg = current_stats.queries["record-view"]
    query = query_cfg.cls(name=query_cfg.name, **query_cfg.params)

    for i in range(3):
        if i != 0:
            # we need to sleep for a little while here because invenio-stats trims
            # the sub-second part from the events before indexing them,
            # (and thus collapses similar events if they are too close in time)
            time.sleep(1.25)

        res = client.get(f"/records/{record.id}")
        assert res.status_code == 200

        # process the event
        processing_result = event.run()
        assert processing_result == (1, 0)

        # refresh the index and check if the event was properly indexed
        dsl.Index(event.index, using=event.client).refresh()
        indexed_events = dsl.Search(using=event.client, index=event.index).execute(
            ignore_cache=True
        )
        indexed_event = indexed_events.hits[0]
        assert indexed_events.hits.total.value == (i + 1)
        assert indexed_event["recid"] == record.id
        assert indexed_event["parent_recid"] == record["parent"]["id"]
        assert indexed_event["via_api"] is False

        # calculate the aggregations and check if the query is correct
        yesterday = datetime.today() - timedelta(days=1)
        tomorrow = datetime.today() + timedelta(days=1)
        agg.run(start_date=yesterday, end_date=tomorrow, update_bookmark=False)
        dsl.Index(agg.index, using=agg.client).refresh()
        query_result = query.run(recid=record.id)
        assert query_result["recid"] == record.id
        assert query_result["parent_recid"] == record["parent"]["id"]
        assert query_result["views"] == (i + 1)
        assert query_result["unique_views"] == 1
