# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
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
            'invenio-app-rdm-search-theme': current_app.config[
                'INSTANCE_SEARCH_THEME_FILE'],
            'invenio-app-rdm-search-js':
                './js/invenio_app_rdm/search/SearchMain/index.js',
            'invenio-app-rdm-searchbar-js':
                './js/invenio_app_rdm/search/SearchBar/index.js'
        },
        dependencies={
            # add any additional npm dependencies here...
            'axios': '^0.19.0',
            'lodash': '^4.17.15',
            'path': '^0.12.7',
            'prop-types': '^15.7.2',
            'qs': '^6.9.1',
            'react': '^16.12.0',
            'react-dom': '^16.12.0',
            'react-redux': '^7.1.3',
            'react-searchkit': '^0.17.0',
            'redux': '^4.0.5',
            'redux-thunk': '^2.3.0',
            "semantic-ui-css": "^2.4.1",
            "semantic-ui-react": "^0.88.0"
        }
    )
