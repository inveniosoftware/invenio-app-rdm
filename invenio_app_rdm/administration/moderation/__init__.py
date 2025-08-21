# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Requests moderation administration module."""

from .requests import ModerationRequestDetailView, ModerationRequestListView

__all__ = ("ModerationRequestListView", "ModerationRequestDetailView")
