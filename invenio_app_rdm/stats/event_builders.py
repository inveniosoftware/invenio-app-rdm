# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Custom event builders for the InvenioRDM statistics.

Note that the arguments to these functions will be the same as passed to the
``EventEmitter`` objects when they are called.
Currently in InvenioRDM this is done in resources (for API) and view functions (for UI).
As such, it is assumed that a request context is available (and thus, Flask's global
``request`` is accessible).
"""

from datetime import datetime

from flask import current_app, request
from invenio_stats.utils import get_user


def file_download_event_builder(event, sender_app, **kwargs):
    """Build a file-download event.

    *Note* that this function assumes a request context by accessing properties of
    Flask's global ``request`` object.
    """
    assert "record" in kwargs
    assert "obj" in kwargs

    record = kwargs["record"]
    obj = kwargs["obj"]
    event.update(
        {
            # When:
            "timestamp": datetime.utcnow().isoformat(),
            # What:
            "bucket_id": str(obj.bucket_id),
            "file_id": str(obj.file_id),
            "file_key": obj.key,
            "size": obj.file.size,
            "recid": record.get("id", None),
            "parent_recid": record.parent.get("id", None),
            # Who:
            "referrer": request.referrer,
            **get_user(),
        }
    )
    return event


def record_view_event_builder(event, sender_app, **kwargs):
    """Build a record-view event.

    *Note* that this function assumes a request context by accessing properties of
    Flask's global ``request`` object.
    """
    assert "record" in kwargs

    record = kwargs["record"]
    event.update(
        {
            # When:
            "timestamp": datetime.utcnow().isoformat(),
            # What:
            "recid": record.get("id", None),
            "parent_recid": record.parent.get("id", None),
            # Who:
            "referrer": request.referrer,
            **get_user(),
            # TODO probably we can add more request context information here for
            #      extra filtering (e.g. URL or query params for discarding the event
            #      when it's a citation text export)
        }
    )
    return event


def check_if_via_api(event, sender_app, **kwargs):
    """Check if the event comes from an API request.

    *Note* that this function assumes a request context by accessing properties of
    Flask's global ``request`` object.
    """
    via_api = None
    if "via_api" in kwargs:
        via_api = kwargs["via_api"]
    else:
        # fallback heuristic: let's check if the request was made to our API URL
        via_api = request.url.startswith(current_app.config["SITE_API_URL"])

    event.update({"via_api": via_api})
    return event


def drop_if_via_api(event, sender_app, **kwargs):
    """Drop the event if it comes from the API."""
    if "via_api" not in event or not event["via_api"]:
        return event

    return None


def build_record_unique_id(event):
    """Build record unique identifier."""
    # NOTE: the 'unique_id' is used by the aggregators to know which events
    #       should be aggregated together... since we want to distinguish between
    #       API and UI events, this needs to be incorporated into the 'unique_id'
    prefix = "api" if event.get("via_api") else "ui"
    event["unique_id"] = f"{prefix}_{event['recid']}"
    return event
