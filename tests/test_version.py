# SPDX-FileCopyrightText: 2019 CERN.
# SPDX-FileCopyrightText: 2019 Northwestern University.
# SPDX-License-Identifier: MIT

"""Simple test of version import."""


def test_version():
    """Test version import."""
    from invenio_app_rdm import __version__

    assert __version__
