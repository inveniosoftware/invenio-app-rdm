# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
# Copyright (C) 2020 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Utility functions."""

from invenio_records.errors import MissingModelError
from invenio_records_files.api import FileObject
from werkzeug.utils import import_string


def previewer_record_file_factory(pid, record, filename):
    """Get file from a record.

    :param pid: Not used. It keeps the function signature.
    :param record: Record which contains the files.
    :param filename: Name of the file to be returned.
    :returns: Previewer compatible File object or ``None`` if not found.
    """
    try:
        if not (hasattr(record, 'files') and record.files):
            return None
    except MissingModelError:
        return None

    try:
        rf = record.files.get(filename)
        if rf is not None:
            return FileObject(obj=rf.file, data=rf.metadata or {})
    except KeyError:
        return None


def obj_or_import_string(value, default=None):
    """Import string or return object.

    :params value: Import path or class object to instantiate.
    :params default: Default object to return if the import fails.
    :returns: The imported object.
    """
    if isinstance(value, str):
        return import_string(value)
    elif value:
        return value
    return default
