# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio Research Data Management."""

import os

from setuptools import find_packages, setup

readme = open('README.rst').read()

invenio_version = '==3.2.1'
invenio_search_version = '>=1.2.0,<1.3.0'
invenio_db_version = '>=1.0.4,<1.1.0'

tests_require = [
    'check-manifest>=0.25',
    'coverage>=4.0',
    'isort>=4.3.3',
    'pydocstyle>=2.0.0',
    'pytest-cov>=2.5.1',
    'pytest-pep8>=1.0.6',
    'pytest-invenio>=1.2.0',
    'pytest>=4.0.0,<5.0.0',
]

setup_requires = [
    'Babel>=1.3',
    'pytest-runner>=3.0.0,<5',
]

extras_require = {
    'elasticsearch6': [
        'invenio-search[elasticsearch6]{}'.format(invenio_search_version)
    ],
    'elasticsearch7': [
        'invenio-search[elasticsearch7]{}'.format(invenio_search_version)
    ],
    'mysql': [
        'invenio-db[mysql,versioning]{}'.format(invenio_db_version)
    ],
    'postgresql': [
        'invenio-db[postgresql,versioning]{}'.format(invenio_db_version)
    ],
    'sqlite': [
        'invenio-db[versioning]{}'.format(invenio_db_version)
    ],
    'docs': [
        'Sphinx>=1.5.1',
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
    'Invenio[base,auth]{}'.format(invenio_version),
    'invenio-rdm-records~=0.9.0',
    'invenio-records-permissions~=0.7.0',
    # Due to search-ui
    'invenio-indexer>=1.1.1,<1.2.0',
    'invenio-jsonschemas>=1.0.1,<1.1.0',
    'invenio-oaiserver>=1.1.1,<1.2.0',
    'invenio-pidstore>=1.1.0,<1.2.0',
    'invenio-records-rest>=1.6.4,<1.7.0',
    'invenio-records-ui>=1.0.1,<1.1.0',
    'invenio-records>=1.3.0,<1.4.0',
    # Due to files-rest
    'invenio-files-rest>=1.1.0,<1.2.0',
    'invenio-iiif>=1.0.0,<1.1.0',
    'invenio-previewer>=1.1.0,<1.2.0',
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
        'console_scripts': [
            'invenio-app-rdm = invenio_app.cli:cli',
        ],
        'invenio_base.blueprints': [
            'invenio_app_rdm = invenio_app_rdm.theme.views:blueprint',
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
        'Development Status :: 3 - Alpha',
    ],
)
