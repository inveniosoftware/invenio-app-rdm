# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
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
                'invenio-app-rdm-landing-page':
                    './js/invenio_app_rdm/landing_page/index.js',
                'invenio-app-rdm-deposit':
                    './js/invenio_app_rdm/deposit/index.js',
                'invenio-app-rdm-search':
                    './js/invenio_app_rdm/search/index.js',
                'invenio-app-rdm-user-records-search':
                    './js/invenio_app_rdm/user_records_search/index.js',
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
                'react-invenio-deposit': '^0.17.2',
                'react-invenio-forms': '^0.9.0',
                'react-dropzone': "^11.0.3",
                'yup': '^0.32.9',
                '@ckeditor/ckeditor5-build-classic': '^16.0.0',
                '@ckeditor/ckeditor5-react': '^2.1.0',
                "i18next": "^20.3.1",
                "react-i18next": "^11.11.3",
                "i18next-browser-languagedetector": "^6.1.1",
                'react-copy-to-clipboard': '^5.0.3'
            },
            aliases={
                # Define Semantic-UI theme configuration needed by
                # Invenio-Theme in order to build Semantic UI (in theme.js
                # entry point). theme.config itself is provided by
                # cookiecutter-invenio-rdm.
                '../../theme.config$': 'less/theme.config',
                'themes/rdm': 'less/invenio_app_rdm/theme',
                '@less/invenio_app_rdm': 'less/invenio_app_rdm',
                '@translations/invenio_app_rdm': 'translations/invenio_app_rdm'
            }
        ),
    }
)
