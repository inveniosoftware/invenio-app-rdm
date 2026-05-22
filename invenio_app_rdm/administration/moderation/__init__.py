# SPDX-FileCopyrightText: 2025 CERN.
# SPDX-License-Identifier: MIT
"""Requests moderation administration module."""

from .requests import ModerationRequestDetailView, ModerationRequestListView

__all__ = ("ModerationRequestListView", "ModerationRequestDetailView")
