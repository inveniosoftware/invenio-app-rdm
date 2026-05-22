# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT

"""Test fixtures for application vocabulary fixtures."""

import pytest
from invenio_app.factory import create_api


@pytest.fixture(scope="module")
def create_app():
    """Application factory fixture."""
    return create_api


@pytest.fixture(scope="module")
def cli_runner(base_app):
    """Create a CLI runner for testing a CLI command."""

    def cli_invoke(command, *args, input=None):
        return base_app.test_cli_runner().invoke(command, args, input=input)

    return cli_invoke
