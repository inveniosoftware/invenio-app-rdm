#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University,
#                     Galter Health Sciences Library & Learning Center.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

# Ignoring false positive 36759 (reporting invenio-admin v1.0.1). This can be
# removed when https://github.com/pyupio/safety-db/pull/2274 is merged and
# released.

pydocstyle invenio_app_rdm tests docs && \
isort invenio_app_rdm tests docs --check-only --diff && \
check-manifest --ignore ".travis-*" && \
sphinx-build -qnNW docs docs/_build/html && \
pytest
