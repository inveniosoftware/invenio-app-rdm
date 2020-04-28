// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

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

  create(record) {
    return this.apiClient.create(record);
  }

  async save(record) {
    let payload = record;
    this.validate(record);
    if (!this.exists(record)) {
      payload = await this.create(record);
      window.history.replaceState(undefined, "", payload.links.edit);
    }
    return this.apiClient.save(payload);
  }

  async publish(record) {
    let payload = record;
    this.validate(record);
    if (!this.exists(record)) {
      payload = await this.create(record);
      window.history.replaceState(undefined, "", payload.links.edit);
    }
    console.log("Record to publish", payload);
    return this.apiClient.publish(payload);
  }
}
