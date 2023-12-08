# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2022 data-futures.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Mirador preview."""

from os.path import splitext

from flask import current_app, render_template
from werkzeug.local import LocalProxy

previewable_extensions = LocalProxy(lambda: current_app.config["IIIF_FORMATS"].keys())

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
    """
    return render_template(
        current_app.config["MIRADOR_PREVIEW_TEMPLATE"],
        html_tags='dir="ltr" mozdisallowselectionprint moznomarginboxes',
        file=file,
    )
