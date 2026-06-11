# SPDX-FileCopyrightText: 2025 CERN.
# SPDX-FileCopyrightText: 2025 KTH Royal Institute of Technology.
# SPDX-License-Identifier: MIT

"""Invenio administration module for groups / roles resources."""

from .roles import RolesCreateView, RolesDetailView, RolesEditView, RolesListView

__all__ = ("RolesListView", "RolesDetailView", "RolesCreateView", "RolesEditView")
