# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
# Copyright (C)      2022 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""JS/CSS Webpack bundles for theme."""

from invenio_assets.webpack import WebpackThemeBundle

theme = WebpackThemeBundle(
    __name__,
    "assets",
    default="semantic-ui",
    themes={
        "semantic-ui": dict(
            entry={
                "invenio-app-rdm-landing-page": "./js/invenio_app_rdm/landing_page/index.js",
                "invenio-app-rdm-landing-page-access-form": "./js/invenio_app_rdm/landing_page/access.js",
                "invenio-app-rdm-landing-page-theme": "./js/invenio_app_rdm/landing_page/theme.js",
                "invenio-app-rdm-deposit": "./js/invenio_app_rdm/deposit/index.js",
                "invenio-app-rdm-search": "./js/invenio_app_rdm/search/index.js",
                "invenio-app-rdm-user-uploads": "./js/invenio_app_rdm/user_dashboard/uploads.js",
                "invenio-app-rdm-user-communities": "./js/invenio_app_rdm/user_dashboard/communities.js",
                "invenio-app-rdm-user-requests": "./js/invenio_app_rdm/user_dashboard/requests.js",
                "invenio-app-rdm-community-records-search": "./js/invenio_app_rdm/communityRecordsSearch/index.js",
                "invenio-app-rdm-collections-search": "./js/invenio_app_rdm/collectionRecordsSearch/index.js",
                "base-theme-rdm": "./js/invenio_app_rdm/theme.js",
                "iiif-simple-previewer": "./less/invenio_app_rdm/previewer/iiif_simple.less",
                "invenio-app-rdm-frontpage": "./js/invenio_app_rdm/frontpage/index.js",
                "overridable-registry": "./js/invenio_app_rdm/overridableRegistry/index.js",
                "invenio-users-moderation-administration": "./js/invenio_app_rdm/administration/userModeration/index.js",
                "invenio-users-administration": "./js/invenio_app_rdm/administration/users/index.js",
                "invenio-records-administration": "./js/invenio_app_rdm/administration/records/index.js",
                "invenio-drafts-administration": "./js/invenio_app_rdm/administration/drafts/index.js",
                "invenio-domains-administration": "./js/invenio_app_rdm/administration/domains/index.js",
                "invenio-audit-logs-administration": "./js/invenio_app_rdm/administration/auditLogs/index.js",
                "invenio-communities-browse": "./js/invenio_app_rdm/subcommunity/browse.js",
            },
            dependencies={
                "@babel/runtime": "^7.9.0",
                "@tinymce/tinymce-react": "^4.3.0",
                "tinymce": "^6.7.2",
                "formik": "^2.1.0",
                "i18next": "^20.3.0",
                "i18next-browser-languagedetector": "^6.1.0",
                "luxon": "^1.23.0",
                "path": "^0.12.7",
                "prop-types": "^15.7.2",
                "react-copy-to-clipboard": "^5.0.0",
                "react-dnd": "^11.1.0",
                "react-dnd-html5-backend": "^11.1.0",
                "react-dropzone": "^11.0.0",
                "react-i18next": "^11.11.0",
                "react-invenio-forms": "^4.0.0",
                "react-searchkit": "^3.0.0",
                "yup": "^0.32.0",
                "json-diff-kit": "^1.0.30",
            },
            aliases={
                # Define Semantic-UI theme configuration needed by
                # Invenio-Theme in order to build Semantic UI (in theme.js
                # entry point). theme.config itself is provided by
                # cookiecutter-invenio-rdm.
                "../../theme.config$": "less/theme.config",
                "../../less/site": "less/site",
                "../../less": "less",
                "themes/rdm": "less/invenio_app_rdm/theme",
                "@less/invenio_app_rdm": "less/invenio_app_rdm",
                "@js/invenio_app_rdm": "js/invenio_app_rdm",
                "@translations/invenio_app_rdm": "translations/invenio_app_rdm",
            },
            copy=[
                # Copy some assets into "static/dist", as TinyMCE requires that
                # Note that the base path for all entries is the `config.json` directory
                {
                    "from": "../node_modules/tinymce/skins/content/default/content.css",
                    "to": "../../static/dist/js/skins/content/default",
                },
                {
                    "from": "../node_modules/tinymce/skins/ui/oxide/skin.min.css",
                    "to": "../../static/dist/js/skins/ui/oxide",
                },
                {
                    "from": "../node_modules/tinymce/skins/ui/oxide/content.min.css",
                    "to": "../../static/dist/js/skins/ui/oxide",
                },
                {
                    "from": "../node_modules/json-diff-kit/dist/viewer.css",
                    "to": "../../static/css/json-diff-kit.css",
                },
            ],
        ),
    },
)
