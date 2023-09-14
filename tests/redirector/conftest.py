# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Redirector test fixtures."""

import pytest


@pytest.fixture(scope="module")
def app_config(app_config, redirection_rules):
    """Override pytest-invenio app_config fixture to disable CSRF check."""
    app_config["REDIRECTOR_RULES"] = redirection_rules

    return app_config


@pytest.fixture(scope="module")
def redirection_rules():
    """Creates a dictionary of redirection rules."""

    def internal_view_function_str():
        """Generates a redirection url to a mock endpoint."""
        from flask import request, url_for

        values = request.view_args
        _type = values["type"]
        values["mock_arg"] = _type
        target = url_for("app_rdm_mock_module.test_app_rdm_mock_endpoint", **values)
        return target

    def internal_view_function_str():
        """Generates a redirection tuple(url, code) to a mock endpoint."""
        from flask import request, url_for

        values = request.view_args
        _type = values["type"]
        values["mock_arg"] = _type
        target = url_for("app_rdm_mock_module.test_app_rdm_mock_endpoint", **values)
        return (target, 302)

    rules = {
        "test_redirector_endpoint_external": {
            "source": "/test/redirect_external",
            "target": "https://cern.ch/",
        },
        "test_redirector_endpoint_internal": {
            "source": "/test/redirect_internal/<type>",
            "target": internal_view_function_str,
        },
    }
    return rules
