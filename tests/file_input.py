# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""FileInput."""

from dataclasses import dataclass
from io import BytesIO


@dataclass
class FileInput:
    """Convenient data bundling for files to initialize."""

    data: dict
    content: BytesIO
