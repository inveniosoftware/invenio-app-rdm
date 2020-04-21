import isEmpty from "lodash/isEmpty";

import { http } from "../http";

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
