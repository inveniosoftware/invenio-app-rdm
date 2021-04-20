# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
# Copyright (C) 2020 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Utility functions."""

from invenio_records.dictutils import dict_set
from invenio_records.errors import MissingModelError
from invenio_records_files.api import FileObject


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


def set_default_value(record_dict, value, path, default_prefix="metadata"):
    """Set the value with the specified dot-separated path in the record.

    :param record_dict: The dict in which to set the value.
    :param value: The value to set (can be callable).
    :param path: The dot-separated path to the value.
    :param default_prefix: The default path prefix to assume.
    """
    if callable(value):
        value = value()

    # if the path explicitly starts with a dot, we know that we shouldn't
    # prepend the default_prefix to the path
    if path.startswith("."):
        path = path[1:]
    else:
        path = "{}.{}".format(default_prefix, path)

    dict_set(record_dict, path, value)
