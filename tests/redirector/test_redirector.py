# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Redirector tests."""


def test_redirector(client_with_login, redirection_rules):
    """Tests redirector resource."""
    client = client_with_login
    for endpoint, rule in redirection_rules.items():
        source = rule["source"]
        target = rule["target"]
        response = client.get(source)
        expected_url = target
        expected_code = 301
        # Target can be either a url or a function that returns a tuple(url, code)
        if callable(target):
            target_output = target()
            if type(target_output) == tuple:
                expected_url, expected_code = target_output
            else:
                expected_url = target_output

        assert response.status_code == expected_code
        assert response.headers["location"] == expected_url
