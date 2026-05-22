/*
 * SPDX-FileCopyrightText: 2024 CERN.
 * SPDX-License-Identifier: MIT
 */

import { http } from "react-invenio-forms";

export class GrantAccessApi {
  constructor(record) {
    this.endpoint = record.links.access_grants;
  }

  createGrants = async (entities, permission, message, notify) => {
    const grants = [];
    for (const [entityId, entity] of Object.entries(entities)) {
      const grant = {
        subject: {
          type: entity.type,
          id: entityId,
        },
        permission: permission,
      };

      if (notify) {
        grant.notify = notify;
      }

      if (message) {
        grant.message = message;
      }

      grants.push(grant);
    }

    const payload = { grants: grants };
    await http.post(this.endpoint, payload);
  };
}
