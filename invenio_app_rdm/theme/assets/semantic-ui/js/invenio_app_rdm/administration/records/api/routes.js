/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import _get from "lodash/get";

const APIRoutesGenerators = {
  delete: (record, idKeyPath = "id") => {
    return `/api/records/${_get(record, idKeyPath)}/delete`;
  },

  restore: (record, idKeyPath = "id") => {
    return `/api/records/${_get(record, idKeyPath)}/restore`;
  },
};
export const APIRoutes = {
  ...APIRoutesGenerators,
};
