import isEmpty from "lodash/isEmpty";

import { http } from "../http";

// WARNING:
/*
  Formik requires a full record in initialValues (but at least empty fields)
  for validation to work.
  ArrayFields requires an empty item to be able to display empty first item.

  Combined those caused us to generate an empty record.

  Problem:
    Frontend sends all fields back:
      some fields that are empty might cause a validation error on the backend
      and therefore an error on frontend for untouched fields
      -> bad user experience

  Solution:
    Pass null rather than empty string
*/

export class DepositAPI {
  constructor(config) {
    this.config = config || {};
  }

  save(record) {
    // For now save always returns a record
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({...record});
      }, 500);
    });
  }

  publish(record) {
    // For now publish always returns an error
    // This has the shape of what our current API returns when there are errors
    // in the API call
    const error = {
      "status": 400,
      "message": "Validation error.",
      "errors": [
        {
          "parents": [],
          "field": "resource_type",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "_created_by",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "creators",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "_owners",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "titles",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "access_right",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "_access",
          "message": "Missing data for required field."
        },
        {
          "parents": [],
          "field": "version",
          "message": "Not a valid string."
        }
      ]
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(error);
      }, 500);
    });
  }
}
