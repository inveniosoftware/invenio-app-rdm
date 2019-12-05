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

import arrow
from flask import Blueprint

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
