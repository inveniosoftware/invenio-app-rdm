#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT

# Usage:
#   ./run-js-linter.sh [args]

# Arguments
# -i|--install: installs eslint-config-invenio
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

for arg in $@; do
    case ${arg} in
        -i|--install)
            npm install --no-save --no-package-lock @inveniosoftware/eslint-config-invenio@^2.0.0
            ;;
        -f|--fix)
            printf "${GREEN}Run eslint${NC}\n";
            npx eslint -c .eslintrc.yml invenio_app_rdm/**/*.js --fix
            ;;
        *)
            printf "Argument ${RED}$arg${NC} not supported\n"
            exit
            ;;
    esac
done

printf "${GREEN}Run eslint${NC}\n"
npx eslint -c .eslintrc.yml invenio_app_rdm/**/*.js
