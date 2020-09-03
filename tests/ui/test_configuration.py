# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
# Copyright (C) 2020 Northwestern University.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Test configuration."""

import pytest


@pytest.fixture(scope='module')
def app_config(app_config):
    """Mimic an instance's configuration."""
    app_config["RDM_RECORDS_UI_NEW_URL"] = '/deposits/new'
    return app_config


# NOTE: We test that appopriate URL rules have been created.
#       We don't use client.get() because webpack needs to be integrated
#       in tests to make the endpoint resolve (and that is effortful).


def test_use_default_url_if_no_config(app):
    search_rules = list(
        app.url_map.iter_rules('invenio_app_rdm.search')
    )

    assert 1 == len(search_rules)
    assert search_rules[0].rule == '/search'


def test_use_configured_url_if_defined(app):
    create_rules = list(
        app.url_map.iter_rules('invenio_app_rdm.deposits_create')
    )

    assert 1 == len(create_rules)
    assert create_rules[0].rule == '/deposits/new'
