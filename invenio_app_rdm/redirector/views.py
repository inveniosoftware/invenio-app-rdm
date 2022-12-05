# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Invenio RDM redirector."""

from __future__ import absolute_import, print_function

from .resource import RedirectorConfig, RedirectorResource


def create_blueprint(app):
    """Creates a blueprint for the redirector resource."""
    resource = RedirectorResource(RedirectorConfig.build(app))
    blueprint = resource.as_blueprint()
    return blueprint
