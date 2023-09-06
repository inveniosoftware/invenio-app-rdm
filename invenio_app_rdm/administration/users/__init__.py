# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# invenio-administration is free software; you can redistribute it and/or
# modify it under the terms of the MIT License; see LICENSE file for more
# details.

"""Invenio administration module for user resources."""
from .users import UsersListView, UsersDetailView

__all__ = ("UsersDetailView", "UsersListView")

