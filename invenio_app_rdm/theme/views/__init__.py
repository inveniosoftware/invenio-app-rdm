# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprints and views for Invenio-App-RDM."""

from .general import ui_blueprint
from .records_ui import file_download_ui, records_ui_blueprint

__all__ = ("file_download_ui", "ui_blueprint", "records_ui_blueprint")
