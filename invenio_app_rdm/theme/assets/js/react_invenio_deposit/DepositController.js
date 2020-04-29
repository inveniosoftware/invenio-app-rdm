// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

// Drives the business logic of the InvenioFormApp.
// Defines what happens when a button is clicked.
export class DepositController {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  exists(record) {
    return record.id ? true : false;
  }

  validate(record) {
    console.log("Validate record", record);
  }

  async save_draft(record) {
    // Saves a draft of the record
    let payload = record;
    this.validate(record);
    if (!this.exists(record)) {
      payload = await this.apiClient.create(record);
      if (payload.errors) {
        console.log("create errors", payload.errors);
      } else {
        const newURL = payload.data.links.edit
        window.history.replaceState(undefined, "", newURL);
      }
    }
    return this.apiClient.save(payload);
  }

  async publish(record) {
    // Publishes a draft to make it a full fledged record
    let payload = record;
    this.validate(record);
    if (!this.exists(record)) {
      payload = await this.apiClient.create(record);
      if (payload.errors) {
        console.log("create errors", payload.errors);
      } else {
        const newURL = payload.data.links.edit
        window.history.replaceState(undefined, "", newURL);
      }
    }
    return this.apiClient.publish(payload.data);
    // TODO: don't return the result of the client directly
    // TODO: Redirect to record page
  }
}
