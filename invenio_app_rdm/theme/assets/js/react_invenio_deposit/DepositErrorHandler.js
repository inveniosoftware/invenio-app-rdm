// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _join from "lodash/join";

export class DepositErrorHandler {
  extractErrors(response) {
    const backendErrors = response.errors;
    const backendErrorMessage = response.message;
    let frontendErrors = { message: backendErrorMessage };
    for (const fieldError of backendErrors) {
      const errorPath = _join([...fieldError.parents, fieldError.field], ".");
      frontendErrors[errorPath] = fieldError.message;
    }
    return frontendErrors;
  }
}
