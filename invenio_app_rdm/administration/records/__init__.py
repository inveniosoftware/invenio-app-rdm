# SPDX-FileCopyrightText: 2023-2024 CERN.
# SPDX-License-Identifier: MIT

"""Invenio app rdm records administration module."""

from invenio_app_rdm.administration.records.records import (
    DraftAdminListView,
    RecordAdminListView,
)

__all__ = ("RecordAdminListView", "DraftAdminListView")
