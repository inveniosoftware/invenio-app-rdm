# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""JS/CSS Webpack bundles for theme."""

from flask import current_app
from invenio_assets.webpack import WebpackThemeBundle


def theme():
    """Returns module's webpack bundle.

    This is a callable function in order to lazy load `current_app`
    and avoid working outside application context.
    """
    return WebpackThemeBundle(
        __name__,
        'assets',
        default='semantic-ui',
        themes={
            'semantic-ui': dict(
                entry={
                    'invenio-app-rdm-theme':
                        current_app.config['INSTANCE_THEME_FILE'],
                    'invenio-app-rdm-search-theme':
                        current_app.config['INSTANCE_SEARCH_THEME_FILE'],
                    'invenio-app-rdm-search-js':
                        './js/invenio_app_rdm/search/SearchMain/index.js',
                    'invenio-app-rdm-searchbar-js':
                        './js/invenio_app_rdm/search/SearchBar/index.js',
                    'invenio-app-rdm-deposits-deposit-searchbar-js':
                        './js/invenio_app_rdm/deposits/RDMDepositSearchBar/index.js',  # noqa
                    'invenio-app-rdm-deposits-deposit-form-js':
                        './js/invenio_app_rdm/deposits/RDMDepositForm/index.js',  # noqa
                },
                dependencies={
                    # add any additional npm dependencies here...
                    "@babel/runtime": "^7.9.0",
                    'axios': '^0.19.2',
                    'formik': '^2.1.4',
                    'lodash': '^4.17.15',
                    'luxon': '^1.23.0',
                    'path': '^0.12.7',
                    'prop-types': '^15.7.2',
                    'qs': '^6.9.1',
                    'react': '^16.13.1',
                    'react-dom': '^16.13.1',
                    'react-invenio-deposit': '^0.2.0',
                    'react-invenio-forms': '^0.3.0',
                    'react-redux': '^7.2',
                    'react-searchkit': '^0.18.0',
                    'redux': '^4.0.5',
                    'redux-thunk': '^2.3.0',
                    "semantic-ui-css": "^2.4.1",
                    "semantic-ui-react": "^0.88.0"
                }
            )
        }
    )
