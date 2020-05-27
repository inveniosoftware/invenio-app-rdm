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
                    'invenio-app-rdm-deposits-deposit-searchbar-js':
                        './js/invenio_app_rdm/deposits/RDMDepositSearchBar/index.js',  # noqa
                    'invenio-app-rdm-deposits-deposit-form-js':
                        './js/invenio_app_rdm/deposits/RDMDepositForm/index.js',  # noqa
                    'invenio-app-rdm-search-app-js':
                        './js/invenio_app_rdm/search_app_customizations.js',
                },
                dependencies={
                    # add any additional npm dependencies here...
                    "@babel/runtime": "^7.9.0",
                    'formik': '^2.1.4',
                    'luxon': '^1.23.0',
                    'path': '^0.12.7',
                    'prop-types': '^15.7.2',
                    'react-invenio-deposit': '^0.2.0',
                    'react-invenio-forms': '^0.3.0',
                },
                aliases={
                    '../../theme.config$': 'less/theme.config',
                    '@templates': "templates",
                }
            ),
        }
    )
