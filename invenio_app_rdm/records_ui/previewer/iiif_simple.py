# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2022 data-futures.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Simple IIIF image preview."""

from os.path import splitext

from flask import current_app, render_template
from werkzeug.local import LocalProxy

previewable_extensions = LocalProxy(lambda: current_app.config["IIIF_FORMATS"].keys())

# extensions that can be put in <img> tag - all others converted to jpg
native_extensions = LocalProxy(
    lambda: current_app.config["IIIF_SIMPLE_PREVIEWER_NATIVE_EXTENSIONS"]
)


def can_preview(file):
    """Check if file can be previewed by this previewer.

    :param file: The file to be previewed.
    :returns: Boolean
    """
    # supported_extensions list needs . prefixed -
    supported_extensions = ["." + ext for ext in previewable_extensions]
    return file.has_extensions(*supported_extensions)


def preview(file):
    """Render template.

    :param file: Image file to preview.
    :returns: Rendered template with image from IIIF service.
    """
    ext = splitext(file.filename)[1].lower()[1:]
    format = ext if ext in native_extensions else "jpg"
    size = LocalProxy(lambda: current_app.config["IIIF_SIMPLE_PREVIEWER_SIZE"])

    url = f"{file.data['links']['iiif_base']}/full/{size}/0/default.{format}"
    return render_template(
        current_app.config["IIIF_PREVIEW_TEMPLATE"],
        css_bundles=["iiif-simple-previewer.css"],
        file=file,
        file_url=url,
    )
