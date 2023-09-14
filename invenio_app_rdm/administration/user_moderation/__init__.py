# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""User moderation administration module."""

from .user_moderation import UserModerationListView, UserModerationRequestDetailView

__all__ = ("UserModerationListView", "UserModerationRequestDetailView")
