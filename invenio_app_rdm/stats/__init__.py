# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-Stats integration for InvenioRDM."""

from .event_builders import (
    build_record_unique_id,
    check_if_via_api,
    drop_if_via_api,
    file_download_event_builder,
    record_view_event_builder,
)

__all__ = (
    "build_record_unique_id",
    "check_if_via_api",
    "drop_if_via_api",
    "file_download_event_builder",
    "record_view_event_builder",
)
