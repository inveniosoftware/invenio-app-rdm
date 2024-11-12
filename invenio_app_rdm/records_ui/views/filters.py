# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
# Copyright (C) 2024 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Filters to be used in the Jinja templates."""

from os.path import splitext

import idutils
from babel.numbers import format_compact_decimal, format_decimal
from flask import current_app, url_for
from invenio_base.utils import obj_or_import_string
from invenio_i18n import get_locale
from invenio_previewer.views import is_previewable
from invenio_records_files.api import FileObject
from invenio_records_permissions.policies import get_record_permission_policy

from ..previewer.iiif_simple import previewable_extensions as image_extensions


def make_files_preview_compatible(files):
    """Processes a list of RecordFiles to a list of FileObjects.

    This is needed to make the objects compatible with invenio-previewer.
    """
    file_objects = []
    for file in files:
        file_objects.append(FileObject(obj=files[file].object_version, data={}).dumps())
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
            return idutils.to_url(identifier, scheme, url_scheme=url_scheme)
    except Exception:
        current_app.logger.warning(
            f"URL generation for identifier {identifier} failed.",
            exc_info=True,
        )
    return ""


def has_previewable_files(files):
    """Check if any of the files is previewable."""
    # 'splitext' inclues the dot of the file extension in the
    # extension, we have to get rid of that
    extensions = [splitext(f["key"])[-1].strip(".").lower() for f in files]
    return any([is_previewable(ext) for ext in extensions])


def has_images(files):
    """Check if any of the files are images (previewable by iiif_simple)."""
    extensions = [splitext(f["key"])[-1].strip(".").lower() for f in files]
    return any(ext in image_extensions for ext in extensions)


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
    else:
        # sort alphabetically by filekey
        files = sorted(files, key=lambda x: x["key"].lower())

    return files


def get_scheme_label(scheme):
    """Convert backend scheme to frontend label."""
    scheme_to_label = current_app.config.get("RDM_RECORDS_IDENTIFIERS_SCHEMES", {})

    return scheme_to_label.get(scheme, {}).get("label", scheme)


def localize_number(value):
    """Format number according to locale value."""
    locale_value = current_app.config.get("BABEL_DEFAULT_LOCALE")
    number = int(value)
    return format_decimal(number, locale=locale_value)


def compact_number(value, max_value):
    """Format long numbers."""
    locale_value = current_app.config.get("BABEL_DEFAULT_LOCALE")
    number = int(value)
    decimals = 0

    if number > max_value:
        decimals = 2
    return format_compact_decimal(
        int(value), format_type="short", locale=locale_value, fraction_digits=decimals
    )


def truncate_number(value, max_value):
    """Make number compact if too long."""
    number = localize_number(value)
    if int(value) > max_value:
        number = compact_number(value, max_value=1_000_000)
    return number


def namespace_url(field):
    """Get custom field namespace url."""
    namespace_array = field.split(":")
    namespace = namespace_array[0]
    namespace_value = namespace_array[1]
    namespaces = current_app.config.get("RDM_NAMESPACES")

    if not namespaces.get(namespace):
        return None

    return namespaces[namespace] + namespace_value


def custom_fields_search(field, field_value, field_cfg=None):
    """Get custom field search url."""
    namespace_array = field.split(":")
    namespace = namespace_array[0]
    namespaces = current_app.config.get("RDM_NAMESPACES")

    if not namespaces.get(namespace):
        return None

    localised_title = (field_cfg or {}).get("locale")
    if localised_title:
        locale = get_locale()
        if not locale:
            locale = current_app.config.get("BABEL_DEFAULT_LOCALE", "en")
        # example: cern:experiments.title.en
        # the \ is necessary for the lucene syntax but produces a SyntaxWarning.
        # The r marks the string as raw and prevents the warning
        # https://docs.python.org/3/reference/lexical_analysis.html#escape-sequences
        namespace_string = r"\:".join(namespace_array) + f".{localised_title}.{locale}"
    else:
        namespace_string = r"\:".join(namespace_array)

    return url_for(
        "invenio_search_ui.search", q=f"custom_fields.{namespace_string}:{field_value}"
    )


def transform_record(record, serializer, module=None, throws=True, **kwargs):
    """Transform a record using a serializer."""
    try:
        module = module or "invenio_rdm_records.resources.serializers"
        import_str = f"{module}:{serializer}"
        serializer = obj_or_import_string(import_str)
        if serializer:
            return serializer().dump_obj(record)
        if throws:
            raise Exception("No serializer found.")
    except Exception:
        current_app.logger.error("Record transformation failed.")
        if throws:
            raise
