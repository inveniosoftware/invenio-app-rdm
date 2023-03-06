# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test the statistics integration."""

from invenio_accounts.testutils import login_user_via_session


def test_ui_event_emission(running_app, headers, client, admin_user):
    """It is expected that the REST API endpoint for the statistics is disabled."""
    login_user_via_session(client, email=admin_user.email)

    # NOTE: the permissions are only relevant per requested query type ("stat")
    data = {"my-query": {"stat": "record-view", "params": {"recid": "doesnt-matter"}}}
    result = client.post("/stats", headers=headers, json=data)
    assert result.status_code == 403

    # i.e. if no queries are requested, nothing will be denied
    result = client.post("/stats", headers=headers, json={})
    assert result.status_code == 200
    assert result.json == {}
