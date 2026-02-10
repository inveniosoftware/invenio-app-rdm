# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2025 CESNET i.a.l.e.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Simple ZIP archive previewer."""

import sys

from flask import render_template
from invenio_access.permissions import system_identity
from invenio_base import invenio_url_for
from invenio_previewer.proxies import current_previewer
from invenio_previewer.views import is_container_item_previewable

from ..views.records import PreviewContainerItem

previewable_extensions = ["zip"]


def create_container_item_preview_link(record_id, container_filename, item_path):
    """Create preview link for a container item."""
    values = {
        "pid_value": record_id,
        "filename": container_filename,  # specific .zip file
        "path": item_path,
    }
    return invenio_url_for(
        "invenio_app_rdm_records.record_container_item_preview", **values
    )


def convert_zip_list_container(entries, folders, record_id, container_filename):
    """Convert structure returned by files.list_container(...).to_dict()."""
    counter = iter(range(sys.maxsize))

    def create_parent_hierarchy(node, path):

        for path_item in path:
            items = node["children"]
            for child_item in items:
                if child_item["name"] == path_item:
                    node = child_item
                    break
            else:
                node = {
                    "type": "folder",
                    "name": path_item,
                    "id": f"folder{next(counter)}",
                    "children": [],
                }
                items.append(node)
        return node

    def convert_file_entry(key, node):
        """Convert one node (file or folder)."""
        converted = {
            "name": key,
            "type": "item",
            "id": f"item{next(counter)}",
        }

        # Copy metadata fields if they exist
        for field in ("size", "compressed_size", "mime_type", "crc", "links"):
            if field in node:
                converted[field] = node[field]

        # create preview link
        container_item_extension = key.split(".")[-1].lower()
        if is_container_item_previewable(container_item_extension):
            converted["links"].update(
                {
                    "preview": create_container_item_preview_link(
                        record_id, container_filename, node["key"]
                    )
                }
            )
        return converted

    def convert_folder(key, node):
        """Convert one node (file or folder)."""
        converted = {
            "name": key,
            "type": "folder",
            "id": f"folder{next(counter)}",
            "children": [],
            "links": node["links"],
        }
        return converted

    # Root folder
    root = {"type": "folder", "id": -1, "children": []}

    # Convert items of root
    for folder in sorted(folders, key=lambda x: x["key"]):
        folder_key = folder["key"].split("/")
        converted = convert_folder(folder_key[-1], folder)
        hierarchy_position = create_parent_hierarchy(root, folder_key[:-1])
        hierarchy_position["children"].append(converted)

    for entry in sorted(entries, key=lambda x: x["key"]):
        entry_key = entry["key"].split("/")
        converted = convert_file_entry(entry_key[-1], entry)
        hierarchy_position = create_parent_hierarchy(root, entry_key[:-1])
        hierarchy_position["children"].append(converted)

    return root


def can_preview(file):
    """Return True if filetype can be previewed."""
    return (
        file.is_local()
        and file.has_extensions(".zip")
        and not isinstance(file, PreviewContainerItem)  # we are top level file
    )


def preview(file):
    """Return the appropriate template and pass the file and an embed flag."""
    from invenio_rdm_records.proxies import current_rdm_records_service

    tree_raw = current_rdm_records_service.files.list_container(
        system_identity, file.record["id"], file.filename
    ).to_dict()

    converted_tree = convert_zip_list_container(
        tree_raw["entries"], tree_raw["folders"], file.record["id"], file.filename
    )
    tree_list = converted_tree["children"]
    return render_template(
        "invenio_previewer/previewable_zip.html",
        file=file,
        tree=tree_list,
        limit_reached=False,
        error=None,
        js_bundles=current_previewer.js_bundles + ["previewable-zip.js"],
        css_bundles=current_previewer.css_bundles + ["zip_css.css"],
    )
