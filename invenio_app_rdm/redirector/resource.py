# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Invenio RDM redirector resource."""

from flask import redirect, request
from flask_resources import Resource, ResourceConfig, route
from invenio_records_resources.services.base.config import ConfiguratorMixin, FromConfig


class RedirectorResource(Resource):
    """Redirector resource class.

    Usage:

    * Example 1 (target as an absolute url)::

        REDIRECTOR_RULES = {
            <endpoint_name>: {
                'source': 'https://johndoe.com',
                'target': 'https://targeturl.com',
            }
        }

    * Example 2 (target as a callback that returns a string)::

        def my_callback():
            from flask import url_for
            return url_for('some_view_name')

        REDIRECTOR_RULES = {
            <endpoint_name>: {
                'source': 'https://johndoe.com',
                'target': my_callback,
            }
        }

    * Example 3 (target is a callback that returns a tuple)::

        def my_callback():
            url = url_for('some_view_name')
            # Redirection HTTP status code is 302
            return (url, 302)

        REDIRECTOR_RULES = {
            <endpoint_name>: {
                'source': 'https://johndoe.com',
                'target': my_callback,
            }
        }
    """

    def __init__(self, config):
        """Instantiates redirector resource, storing the redirection rules."""
        super().__init__(config)
        self.rules = self.config.rules

    def create_url_rules(self):
        """Generates a list of rules, based on flask_resources.route. View methods are generated using a factory."""
        url_rules = []
        for endpoint, rule in self.rules.items():
            source = rule["source"]
            url_rules.append(
                route(
                    method="GET",
                    rule=source,
                    view_meth=self.redirect_view_factory,
                    endpoint=endpoint,
                    rule_options=rule.get("rule_options"),
                )
            )
        return url_rules

    def redirect_view_factory(self):
        """Factory to create views which redirect requests to a URL."""
        bp_endpoint = request.url_rule.endpoint

        # Strip BP name prefix from endpoint
        endpoint_name = bp_endpoint.replace(f"{self.config.blueprint_name}.", "")
        triggered_rule = self.rules[endpoint_name]
        target = triggered_rule["target"]
        redirect_url = target
        code = 301

        # Retrieve url from target if it's a method
        if callable(target):
            target_output = redirect_url()
            if type(target_output) == tuple:
                redirect_url, code = target_output
            else:
                redirect_url = target_output

        # Redirect to target
        return redirect(redirect_url, code)


class RedirectorConfig(ResourceConfig, ConfiguratorMixin):
    """Redirector config. Sets rules to config['REDIRECTOR_RULES'] if any."""

    # Blueprint configuration
    blueprint_name = "invenio_redirector"

    rules = FromConfig("REDIRECTOR_RULES", {})
