/*
 * SPDX-FileCopyrightText: 2023 CERN.
 * SPDX-License-Identifier: MIT
 */

import _get from "lodash/get";

const APIRoutesGenerators = {
  restore: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/restore`;
  },

  block: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/block`;
  },

  approve: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/approve`;
  },

  activate: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/activate`;
  },

  deactivate: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/deactivate`;
  },

  impersonate: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/impersonate`;
  },
};
export const APIRoutes = {
  ...APIRoutesGenerators,
};
