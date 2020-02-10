# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Blueprint used for loading templates.

The sole purpose of this blueprint is to ensure that Invenio can find the
templates and static files located in the folders of the same names next to
this file.
"""

from __future__ import absolute_import, print_function

from flask import Blueprint, current_app, render_template

blueprint = Blueprint(
    'invenio_app_rdm',
    __name__,
    template_folder='templates',
    static_folder='static',
)


@blueprint.route('/search')
def search():
    """Search page."""
    return render_template(current_app.config['SEARCH_BASE_TEMPLATE'])
