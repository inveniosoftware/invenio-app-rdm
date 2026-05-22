# SPDX-FileCopyrightText: 2024 CERN.
# SPDX-License-Identifier: MIT

"""Invenio administration module for user resources."""

from .domains import (
    DomainsCreateView,
    DomainsDetailView,
    DomainsEditView,
    DomainsListView,
)

__all__ = (
    "DomainsCreateView",
    "DomainsDetailView",
    "DomainsEditView",
    "DomainsListView",
)
