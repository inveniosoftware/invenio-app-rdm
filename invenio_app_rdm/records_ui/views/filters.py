# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Filters to be used in the Jinja templates."""

from operator import itemgetter
from os.path import splitext

import idutils
from flask import current_app
from invenio_previewer.views import is_previewable
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.vocabularies import Vocabularies
from invenio_records_files.api import FileObject
from invenio_records_permissions.policies import get_record_permission_policy


def make_files_preview_compatible(files):
    """Processes a list of RecordFiles to a list of FileObjects.

    This is needed to make the objects compatible with invenio-previewer.
    """
    file_objects = []
    for file in files:
        file_objects.append(
            FileObject(obj=files[file].object_version, data={}).dumps()
        )
    return file_objects


def select_preview_file(files, default_preview=None):
    """Return file to preview or None if no previewable file."""
    selected = None
    for f in files or []:
        file_type = splitext(f.get("key", ""))[1][1:].lower()
        if is_previewable(file_type):
            if selected is None:
                selected = f
            elif f.get("key") == default_preview:
                return f
    return selected


def to_previewer_files(record):
    """Get previewer-compatible files list."""
    return [
        FileObject(obj=f.object_version, data=f.metadata or {})
        for f in record.files.values()
    ]


def can_list_files(record):
    """Permission check if current user can list files of record.

    The current_user is used under the hood by flask-principal.

    Once we move to Single-Page-App approach, we likely want to enforce
    permissions at the final serialization level (only).
    """
    PermissionPolicy = get_record_permission_policy()
    return PermissionPolicy(action="read_files", record=record).can()


def pid_url(identifier, scheme=None, url_scheme="https"):
    """Convert persistent identifier into a link."""
    if scheme is None:
        try:
            scheme = idutils.detect_identifier_schemes(identifier)[0]
        except IndexError:
            scheme = None
    try:
        if scheme and identifier:
            return idutils.to_url(
                identifier, scheme, url_scheme=url_scheme
            )
    except Exception:
        current_app.logger.warning(
            f"URL generation for identifier {identifier} failed.",
            exc_info=True,
        )
    return ""


def doi_identifier(identifiers):
    """Extract DOI from sequence of identifiers."""
    doi_identifier = identifiers.get("doi")
    return doi_identifier['identifier'] if doi_identifier else None


def vocabulary_title(dict_key, vocabulary_key, alt_key=None):
    """Returns formatted vocabulary-corresponding human-readable string.

    In some cases the dict needs to be reconstructed. `alt_key` will be the
    key while `dict_key` will become the value.
    """
    if alt_key:
        dict_key = {alt_key: dict_key}
    vocabulary = Vocabularies.get_vocabulary(vocabulary_key)
    return vocabulary.get_title_by_dict(dict_key) if vocabulary else ""


def has_previewable_files(files):
    """Check if any of the files is previewable."""
    # 'splitext' inclues the dot of the file extension in the
    # extension, we have to get rid of that
    extensions = [
        ext[1:] if ext.startswith(".") else ext
        for ext in (splitext(f["key"])[-1] for f in files)
    ]

    return any([is_previewable(ext.lower()) for ext in extensions])


def order_entries(files):
    """Re-order the file entries, if an order is given."""
    order = files.get("order")
    files = files.get("entries", [])
    if order:
        files_ = files.copy()
        keys = [f["key"] for f in files]

        def get_file(key):
            idx = keys.index(key)
            keys.pop(idx)
            return files_.pop(idx)

        files = [get_file(key) for key in order]

    return files
