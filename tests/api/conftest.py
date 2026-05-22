# SPDX-FileCopyrightText: 2019 CERN.
# SPDX-FileCopyrightText: 2019 Northwestern University.
# SPDX-License-Identifier: MIT

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
