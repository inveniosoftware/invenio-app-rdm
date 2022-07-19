# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Pytest fixtures and plugins for the API application."""

import pytest
from invenio_app.factory import create_api


@pytest.fixture(scope="module")
def create_app():
    """Create test app."""
    return create_api


@pytest.fixture(scope="module")
def headers():
    """Return typical API headers."""
    return {"content-type": "application/json", "accept": "application/json"}
