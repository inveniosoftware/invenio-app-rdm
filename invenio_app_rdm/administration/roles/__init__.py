# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration module for groups / roles resources."""

from .roles import RolesCreateView, RolesDetailView, RolesEditView, RolesListView

__all__ = ("RolesListView", "RolesDetailView", "RolesCreateView", "RolesEditView")
