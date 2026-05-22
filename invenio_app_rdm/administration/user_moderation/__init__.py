# SPDX-FileCopyrightText: 2023 CERN.
# SPDX-License-Identifier: MIT
"""User moderation administration module."""

from .user_moderation import UserModerationListView, UserModerationRequestDetailView

__all__ = ("UserModerationListView", "UserModerationRequestDetailView")
