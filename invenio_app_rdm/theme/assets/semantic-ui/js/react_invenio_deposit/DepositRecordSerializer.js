// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _cloneDeep from "lodash/cloneDeep";

export class DepositRecordSerializer {
  deserialize(record) {
    return record;
  }

  _isNullEquivalent = (obj) => {
    // Identifies null equivalent obj
    if (obj === null) {
      return true;
    } else if (Array.isArray(obj)) {
      return obj.every(this._isNullEquivalent);
    } else if (typeof obj == "object") {
      return Object.values(obj).every(this._isNullEquivalent);
    } else {
      return false;
    }
  };

  stripNullEquivalentFields(obj) {
    // Returns Object with top-level null equivalent fields stripped
    const result = {};

    for (const key of Object.keys(obj)) {
      if (!this._isNullEquivalent(obj[key])) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  serialize(record) {
    let stripped_record = this.stripNullEquivalentFields(record);
    // TODO: Remove when fields are implemented and
    // we use deposit backend API
    let _missingRecordFields = {
      access_right: "open",
      _access: {
        metadata_restricted: false,
        files_restricted: false,
      },
      _owners: [1],
      _created_by: 1,
      titles: [
        {
          lang: "eng",
          type: "MainTitle",
          title: stripped_record["titles"]
            ? stripped_record["titles"][0]["title"]
            : "",
        },
      ],
      // TODO: Remove this when we fix the `Identifiers` schema
      creators: [],
      contributors: [],
      // TODO: Remove these when fields are implemented
      // also these fields are making the record landing page
      // to fail if they don't exist
      identifiers: {
        DOI: "10.9999/rdm.9999999",
      },
      descriptions: [
        {
          description: "Remove me",
          lang: "eng",
          type: "Abstract",
        },
      ],
      community: {
        primary: "Maincom",
        secondary: ["Subcom One", "Subcon Two"],
      },
    };
    return { ...stripped_record, ..._missingRecordFields };
  }
}
