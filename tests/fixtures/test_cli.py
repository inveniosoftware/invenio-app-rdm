# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Tests for the CLI."""

from invenio_access.permissions import system_identity
from invenio_rdm_records.proxies import current_oaipmh_server_service

from invenio_app_rdm.cli import create_fixtures


def test_create_fixtures(app, db, cli_runner):
    """Assert that fixtures are created."""
    result = cli_runner(create_fixtures)
    assert result.exit_code == 0

    service = current_oaipmh_server_service
    res_set = service.search(system_identity, params={"q": f"%"})

    # oai_sets.yaml file left empty
    assert res_set.total == 0
