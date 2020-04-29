// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _isEmpty from "lodash/isEmpty";

export class DepositApiClient {
  create(record) {
    // Calls the API to create a new record
    // TODO: Integrate with backend API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var newRecord = {
          id: "q11jz-kkn59",
          links: {
            edit: "/deposits/q11jz-kkn59/edit",
          },
          ...record,
        };
        console.log("Record created", newRecord);
        resolve({data: newRecord});
      }, 100);
    });
  }

  save(record) {
    // Calls the API to save a pre-existing record.
    // If the record does not exist, an error is returned.
    // TODO: Integrate with backend API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Record saved", record);
        resolve({data: record});
      }, 500);
    });
  }

  publish(record) {
    // For now publish returns an error when titles array is empty
    // This has the shape of what our current API returns when there are errors
    // in the API call
    // TODO: Integrate with backend API
    let response = null;
    if (_isEmpty(record.titles)) {
      response = {
        status: 400,
        message: "Validation error.",
        errors: [
          {
            parents: ["titles", "0"],
            field: "title",
            message: "Missing data for required field.",
          },
        ],
      };
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(response);
        }, 500);
      });
    } else {
      response = {
        status: 200,
        data: record,
      };
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(response);
        }, 500);
      });
    }
  }
}
