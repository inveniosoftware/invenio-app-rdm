# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
# Copyright (C) 2020 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Utility functions."""

from itertools import chain

from flask import current_app, url_for
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
        if not (hasattr(record, "files") and record.files):
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


def get_external_resources(record):
    """Make number compact if too long."""
    result = []
    resources_cfg = current_app.config["APP_RDM_RECORD_LANDING_PAGE_EXTERNAL_LINKS"]
    for cfg in resources_cfg:
        res = cfg["render"](record)
        if res:
            result.append(res)
    return list(chain.from_iterable(result))


def dump_external_resource(
    identifier, icon, title, section, subtitle=None, template=None
):
    """Dumps a external resource dictionary."""
    return {
        "content": {
            "url": identifier.get("identifier"),
            "title": title,
            "subtitle": subtitle,
            "icon": icon,
            "section": section,
        },
        "template": template,
    }


# The following parsers would need to be implenented by the instance
def github_link_render(record):
    """Entry for Github."""
    # [TODO] Integrate Inveio_Github here
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "github.com" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/github.svg"),
                    identifier.get("identifier").replace("https://github.com/", ""),
                    "Available in",
                )
            )
    return resources or None


def openaire_link_render(record):
    """Entry for Openaire."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "openaire" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/openaire.svg"),
                    "OpenAIRE EXPLORE",
                    "Indexed in",
                )
            )
    return resources or None


def f1000_link_render(record):
    """Entry for F1000."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "f1000" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/f1000.svg"),
                    "F1000 Explore",
                    "Found in",
                )
            )
    return resources or None


def dryad_link_render(record):
    """Entry for Dryad."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "dryad" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/dryad.svg"),
                    "Dryad Explore",
                    "Found in",
                )
            )
    return resources or None


def inspire_link_render(record):
    """Entry for Inspire."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "inspire" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/inspire.svg"),
                    "Inspire Explore",
                    "Found in",
                )
            )
    return resources or None


def orcid_link_render(record):
    """Entry for Orcid."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "orcid" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/orcid.svg"),
                    "Orcid Explore",
                    "Found in",
                )
            )
    return resources or None


def reana_link_render(record):
    """Entry for Reana."""
    resources = []

    related_identifiers = record["ui"].get("related_identifiers", [])
    for identifier in related_identifiers:
        if identifier["scheme"] == "url" and "reana" in identifier["identifier"]:
            resources.append(
                dump_external_resource(
                    identifier,
                    url_for("static", filename="images/reana.svg"),
                    "Reana Explore",
                    "Found in",
                )
            )
    return resources or None
