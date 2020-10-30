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

# Quit on errors
set -o errexit

# Quit on unbound symbols
set -o nounset

python -m check_manifest --ignore ".*-requirements.txt" && \
python -m sphinx.cmd.build -qnNW docs docs/_build/html && \
docker-services-cli up es postgresql redis
python -m pytest
tests_exit_code=$?
docker-services-cli down
exit "$tests_exit_code"
