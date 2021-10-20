# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio Research Data Management."""

import os

from setuptools import find_packages, setup

readme = open('README.rst').read()

invenio_version = '~=3.5.0a3'
invenio_search_version = '>=1.4.2,<1.5.0'
invenio_db_version = '>=1.0.9,<1.1.0'

tests_require = [
    'pytest-invenio~=1.4.2',
]

setup_requires = [
    'Babel>=2.8,<3',
]

extras_require = {
    # Invenio-Search
    'elasticsearch6': [
        f'invenio-search[elasticsearch6]{invenio_search_version}'
    ],
    'elasticsearch7': [
        f'invenio-search[elasticsearch7]{invenio_search_version}'
    ],
    # Invenio-DB
    'mysql': [
        f'invenio-db[mysql,versioning]{invenio_db_version}'
    ],
    'postgresql': [
        f'invenio-db[postgresql,versioning]{invenio_db_version}'
    ],
    'sqlite': [
        f'invenio-db[versioning]{invenio_db_version}'
    ],
    # Storage plugins
    's3': [
        'invenio-s3~=1.0.5'
    ],
    # Extras
    'docs': [
        'Sphinx==4.2.0',
    ],
    'tests': tests_require,
}

extras_require['all'] = []
for name, reqs in extras_require.items():
    if name[0] == ':' or name in ('elasticsearch6', 'elasticsearch7',
                                  'mysql', 'postgresql', 'sqlite'):
        continue
    extras_require['all'].extend(reqs)

install_requires = [
    'CairoSVG>=2.5.2,<3.0.0',
    f'invenio[base,auth,metadata,files]{invenio_version}',
    'invenio-communities>=2.6.0.dev1,<2.7.0',
    'invenio-logging[sentry-sdk]>=1.3.0,<1.4.0',
    'invenio-rdm-records>=0.33.2,<0.34.0',
]

packages = find_packages()

# Get the version string. Cannot be done with import!
g = {}
with open(os.path.join('invenio_app_rdm', 'version.py'), 'rt') as fp:
    exec(fp.read(), g)
    version = g['__version__']

setup(
    name='invenio-app-rdm',
    version=version,
    description=__doc__,
    long_description=readme,
    keywords='invenio-app-rdm Invenio',
    license='MIT',
    author='CERN',
    author_email='info@inveniosoftware.org',
    url='https://github.com/inveniosoftware/invenio-app-rdm',
    packages=packages,
    zip_safe=False,
    include_package_data=True,
    platforms='any',
    entry_points={
        'invenio_base.blueprints': [
            'invenio_app_rdm_records = ' \
                'invenio_app_rdm.records_ui.views:create_blueprint',
            'invenio_app_rdm = invenio_app_rdm.theme.views:create_blueprint',
        ],
        'invenio_assets.webpack': [
            'invenio_app_rdm_theme = invenio_app_rdm.theme.webpack:theme',
        ],
        'invenio_config.module': [
            'invenio_app_rdm = invenio_app_rdm.config',
        ],
        'invenio_i18n.translations': [
            'messages = invenio_app_rdm',
        ],
    },
    extras_require=extras_require,
    install_requires=install_requires,
    setup_requires=setup_requires,
    tests_require=tests_require,
    classifiers=[
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Development Status :: 5 - Production/Stable',
    ],
)
