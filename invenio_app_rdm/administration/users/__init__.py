# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2024 Ubiquity Press.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration module for user resources."""
from .users import UsersCreateView, UsersDetailView, UsersListView

__all__ = ("UsersCreateView", "UsersDetailView", "UsersListView")
