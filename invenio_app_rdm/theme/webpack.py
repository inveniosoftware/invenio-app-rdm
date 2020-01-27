# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""JS/CSS Webpack bundles for theme."""

from __future__ import absolute_import, print_function

from flask import current_app
from flask_webpackext import WebpackBundle


def theme():
    """Returns module's webpack bundle.

    This is a callable function in order to lazy load `current_app`
    and avoid working outside application context.
    """
    return WebpackBundle(
        __name__,
        'assets',
        entry={
            'invenio-app-rdm-theme': current_app.config['INSTANCE_THEME_FILE'],
            'invenio-app-rdm-js': './js/invenio_app_rdm/inveniordm.js',
        },
        dependencies={
            # add any additional npm dependencies here...
        }
    )
