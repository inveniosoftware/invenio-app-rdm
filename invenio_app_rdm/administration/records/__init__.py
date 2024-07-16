# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio app rdm records administration module."""

from invenio_app_rdm.administration.records.records import (
    DraftAdminListView,
    RecordAdminListView,
)

__all__ = ("RecordAdminListView", "DraftAdminListView")
