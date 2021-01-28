# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""JS/CSS Webpack bundles for theme."""

from invenio_assets.webpack import WebpackThemeBundle

theme = WebpackThemeBundle(
    __name__,
    'assets',
    default='semantic-ui',
    themes={
        'semantic-ui': dict(
            entry={
                'invenio-app-rdm-records':
                    './js/invenio_app_rdm/landing_page/index.js',
                'invenio-app-rdm-record-management':
                    './js/invenio_app_rdm/landing_page/recordManagement.js',
                'invenio-app-rdm-deposits-deposit-form-js':
                    './js/invenio_app_rdm/deposits/RDMDepositForm/index.js',
                'rdm_search_app': './js/invenio_app_rdm/search/index.js',
                'rdm_deposits_search_app':
                    './js/invenio_app_rdm/deposits/search/index.js',
            },
            dependencies={
                # add any additional npm dependencies here...
                "@babel/runtime": "^7.9.0",
                'formik': '^2.1.4',
                'luxon': '^1.23.0',
                'path': '^0.12.7',
                'prop-types': '^15.7.2',
                'react-dnd': '^11.1.3',
                'react-dnd-html5-backend': '^11.1.3',
                'react-invenio-deposit': '^0.10.4',
                'react-invenio-forms': '^0.5.3',
                'react-dropzone': "^11.0.3",
                '@ckeditor/ckeditor5-build-classic': '^16.0.0',
                '@ckeditor/ckeditor5-react': '^2.1.0',
            },
            aliases={
                # Define Semantic-UI theme configuration needed by
                # Invenio-Theme in order to build Semantic UI (in theme.js
                # entry point). theme.config itself is provided by
                # cookiecutter-invenio-rdm.
                '../../theme.config$': 'less/theme.config',
            }
        ),
    }
)
