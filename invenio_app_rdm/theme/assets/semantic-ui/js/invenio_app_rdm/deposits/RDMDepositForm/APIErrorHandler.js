// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _get from 'lodash/get';

export class APIErrorHandler {
  constructor(vocabularies) {
    this.vocabularies = vocabularies;
  }

  /**
   * Return Formik error object of keys (dotted paths to fields) and values
   * (error message)
   *
   * @param {Error} error - Axios error
   * @param {object} record - frontend record object
   */
  extractErrors(error, record) {
    let frontendErrors = { message: _get(error, "response.data.message", "") };
    const APIErrors = _get(error, "response.data.errors", []);
    // fieldPaths = new FieldPaths(record);
    for (const apiFieldError of APIErrors) {
      this.fillErrors(frontendErrors, apiFieldError);
      // fieldPaths.choose(apiFieldError).remap(frontendErrors, apiFieldError);
    }
    return frontendErrors;
  }

  /**
   * Fill error object sent to Formik
   *
   * @param {object} errors - frontend error object
   * @param {object} apiFieldError - backend field error
   */
  fillErrors(errors, apiFieldError) {
    let field = apiFieldError.field;
    let message = apiFieldError.messages.join("<br/>");

    if (field.startsWith("access.access_right")) {
      for (const entry of this.vocabularies.access.access_right) {
        message = message.replace(entry.value, entry.text);
      }
    }
    errors[field] = message;
  }
}

// class CreatorsIdentifiersFieldPath {
//   constructor(path) {
//     this.path = path;
//   }

//   remapto(target, fieldError) {
//     this.match(fieldError.field);
//     target[]

//   }
// }

// /**
//  * Update frontendErrors object with error entry (key value pair)
//  *
//  * @param {object} frontendErrors
//  * @param {object} backendFieldError
//  * @param {object} record
//  */
// updateFrontendErrors(frontendErrors, backendFieldError, record) {
//   let dottedPath = backendFieldError.field;
//   const arrayPath = dottedPath.split(".");

//   // only consider metadata.<rest of path> errors
//   if (arrayPath.length < 2 || arrayPath[0] !== "metadata") {
//     return;
//   }
//   console.log("arrayPath", arrayPath);


//   // Generate the frontend appropriate dotted path
//   switch (arrayPath[1]) {
//     case "identifiers":
//       console.log("do something special for this case");
//       // Because the frontend (due to Formik) represents identifiers as
//       // an array, we need to convert API errors which are represented as
//       // objects
//       console.log("updateFrontendErrors record", record);
//       console.log("updateFrontendErrors backendFieldError", backendFieldError);
//       // get frontend record path to backendFielderror field
//       // set dottedPath to it
//       // dottedPath = "..."
//       break;

//     default:
//       dottedPath = arrayPath.slice(1).join(".");
//       break;
//   }

//   frontendErrors[dottedPath] = backendFieldError.messages.join("<br/>");
// }
