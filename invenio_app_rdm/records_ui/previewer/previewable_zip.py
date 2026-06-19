# SPDX-FileCopyrightText: 2025 CESNET i.a.l.e.
# SPDX-License-Identifier: MIT

"""Simple ZIP archive previewer."""

import sys

from flask import current_app, render_template
from invenio_access.permissions import system_identity
from invenio_base import invenio_url_for
from invenio_previewer.proxies import current_previewer
from invenio_previewer.views import is_container_item_previewable
from invenio_rdm_records.proxies import current_rdm_records_service
from werkzeug.local import LocalProxy

from ..views.records import PreviewContainerItem

previewable_extensions = LocalProxy(
    lambda: current_app.config["PREVIEWABLE_ZIP_PREVIEWER_NATIVE_EXTENSIONS"]
)


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


def convert_zip_list_container(entries, directories, record_id, container_filename):
    """Convert structure returned by files.list_container(...).to_dict()."""
    counter = iter(range(sys.maxsize))

    def create_parent_hierarchy(node, path):
        """Create and get the child node at the specified path from the given parent node."""
        for path_item in path:
            items = node["children"]
            for child_item in items:
                if child_item["name"] == path_item:
                    node = child_item
                    break
            else:
                node = {
                    "type": "directory",
                    "name": path_item,
                    "id": f"directory{next(counter)}",
                    "children": [],
                }
                items.append(node)
        return node

    def convert_file_entry(key, node):
        """Convert one node (file or directory)."""
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

    def convert_directory(key, node):
        """Convert one node (file or directory)."""
        converted = {
            "name": key,
            "type": "directory",
            "id": f"directory{next(counter)}",
            "children": [],
            "links": node["links"],
        }
        return converted

    # Root directory
    root = {"type": "directory", "id": -1, "children": []}

    # Convert items of root
    for directory in sorted(directories, key=lambda x: x["key"]):
        directory_key = directory["key"].split("/")
        converted = convert_directory(directory_key[-1], directory)
        hierarchy_position = create_parent_hierarchy(root, directory_key[:-1])
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
    error = None
    try:
        tree_raw = current_rdm_records_service.files.list_container(
            system_identity, file.record["id"], file.filename
        ).to_dict()
    except Exception as e:
        error = e
        tree_raw = {
            "entries": [],
            "directories": [],
        }

    converted_tree = convert_zip_list_container(
        tree_raw["entries"], tree_raw["directories"], file.record["id"], file.filename
    )
    tree_list = converted_tree["children"]
    return render_template(
        "invenio_previewer/previewable_zip.html",
        file=file,
        tree=tree_list,
        limit_reached=False,
        error=error,
        js_bundles=current_previewer.js_bundles + ["previewable-zip.js"],
        css_bundles=current_previewer.css_bundles + ["zip_css.css"],
    )
