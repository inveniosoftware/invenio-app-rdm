# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration module for user resources."""

from .users import UsersDetailView, UsersListView

__all__ = ("UsersDetailView", "UsersListView")
