# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2025 CESNET i.a.l.e.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Simple ZIP archive previewer."""

from flask import render_template
from invenio_access.permissions import system_identity
from invenio_base import invenio_url_for
from invenio_previewer.proxies import current_previewer
from invenio_previewer.views import is_container_item_previewable

from invenio_app_rdm.records_ui.views.records import ContainerItemPreview

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


def convert_zip_list_container(tree, record_id, container_filename):
    """Convert structure returned by files.list_container(...).to_dict()."""

    def convert_node(key, node, counter):
        """Convert one node (file or folder)."""
        converted = {
            "name": key,
            "type": "item",  # previewer later decides if it's folder
            "id": f"item{next(counter)}",
            "children": {},
        }

        # Copy metadata fields if they exist
        for field in ("size", "compressed_size", "mime_type", "crc", "links"):
            if field in node:
                converted[field] = node[field]

        # Case 1: File
        if node.get("type") == "file":
            # create preview link
            container_item_extension = node.get("key", "").split(".")[-1].lower()
            if is_container_item_previewable(container_item_extension):
                converted["links"].update(
                    {
                        "preview": create_container_item_preview_link(
                            record_id, container_filename, node["id"]
                        )
                    }
                )
            return converted

        # Case 2: Folder
        children = node.get("children", {})
        for child_key, child_node in children.items():
            converted["children"][child_key] = convert_node(
                child_key, child_node, counter
            )

        return converted

    # ID counter for "item0", "item1", ...
    def counter_gen():
        i = 0
        while True:
            yield i
            i += 1

    counter = counter_gen()

    # Root folder
    root = {"type": "folder", "id": -1, "children": {}}

    # Convert children of root
    for key, child in tree.get("children", {}).items():
        root["children"][key] = convert_node(key, child, counter)

    return root


def children_to_list(node):
    """Organize children structure."""
    if node["type"] == "item" and len(node["children"]) == 0:
        del node["children"]
    else:
        node["type"] = "folder"
        node["children"] = list(node["children"].values())
        node["children"].sort(key=lambda x: x["name"])
        node["children"] = map(children_to_list, node["children"])
    return node


def can_preview(file):
    """Return True if filetype can be previewed."""
    return (
        file.is_local()
        and file.has_extensions(".zip")
        and not isinstance(file, ContainerItemPreview)  # we are top level file
    )


def preview(file):
    """Return the appropriate template and pass the file and an embed flag."""
    from invenio_rdm_records.proxies import current_rdm_records_service

    tree_raw = current_rdm_records_service.files.list_container(
        system_identity, file.record["id"], file.filename
    ).to_dict()

    converted_tree = convert_zip_list_container(
        tree_raw, file.record["id"], file.filename
    )
    tree_list = children_to_list(converted_tree)["children"]
    return render_template(
        "invenio_previewer/previewable_zip.html",
        file=file,
        tree=tree_list,
        limit_reached=False,
        error=None,
        js_bundles=current_previewer.js_bundles + ["previewable-zip.js"],
        css_bundles=current_previewer.css_bundles + ["zip_css.css"],
    )
