/*
 * SPDX-FileCopyrightText: 2023-2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import _get from "lodash/get";

const APIRoutesGenerators = {
  delete: (record, idKeyPath = "id") => {
    return `/api/records/${_get(record, idKeyPath)}/delete`;
  },
  compare: (record, idKeyPath = "id") => {
    return `/api/records/${_get(record, idKeyPath)}/revisions`;
  },
  restore: (record, idKeyPath = "id") => {
    return `/api/records/${_get(record, idKeyPath)}/restore`;
  },
  lastRevision: (record, revisionId, includePrevious = false, idKeyPath = "id") => {
    return `/api/records/${_get(
      record,
      idKeyPath
    )}/revisions/${revisionId}?include_previous=${includePrevious}`;
  },
};
export const APIRoutes = {
  ...APIRoutesGenerators,
};
