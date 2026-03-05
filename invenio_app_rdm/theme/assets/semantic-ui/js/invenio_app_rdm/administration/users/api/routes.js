/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
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

  userGroups: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/groups`;
  },

  setGroups: (user, idKeyPath = "id") => {
    return `/api/users/${_get(user, idKeyPath)}/groups`;
  },

  groups: () => {
    return "/api/groups";
  },
};
export const APIRoutes = {
  ...APIRoutesGenerators,
};
