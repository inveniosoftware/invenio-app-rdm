# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprint used for loading templates.

The sole purpose of this blueprint is to ensure that Invenio can find the
templates and static files located in the folders of the same names next to
this file.
"""

from __future__ import absolute_import, print_function

from os.path import splitext

import arrow
from flask import Blueprint
from invenio_previewer.views import is_previewable
from invenio_records_permissions.policies import get_record_permission_policy

blueprint = Blueprint(
    'invenio_app_rdm',
    __name__,
    template_folder='templates',
    static_folder='static',
)


@blueprint.app_template_filter('to_date')
def to_date(date_string):
    """Return a Date object from a passed date string.

    Typically used as follows:

        ```jinja2
        {{ date_string | to_date | date_format("long") }}
        ```
    """
    assert isinstance(date_string, str)
    return arrow.get(date_string).date()


@blueprint.app_template_filter('select_previewable')
def select_previewable(files):
    """Return files that are previewable."""
    def extension(file):
        return splitext(file.get('key'))[1][1:].lower()

    return [
        f for f in files
        if is_previewable(extension(f))
    ]


@blueprint.app_template_filter('can_list_files')
def can_list_files(record):
    """Permission check if current user can list files of record.

    The current_user is used under the hood by flask-principal.

    Once we move to Single-Page-App approach, we likely want to enforce
    permissions at the final serialization level (only).
    """
    PermissionPolicy = get_record_permission_policy()
    return PermissionPolicy(action='read_files', record=record).can()
