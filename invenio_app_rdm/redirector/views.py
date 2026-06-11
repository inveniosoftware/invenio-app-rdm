# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT
"""Invenio RDM redirector."""

from __future__ import absolute_import, print_function

from .resource import RedirectorConfig, RedirectorResource


def create_blueprint(app):
    """Creates a blueprint for the redirector resource."""
    resource = RedirectorResource(RedirectorConfig.build(app))
    blueprint = resource.as_blueprint()
    return blueprint
