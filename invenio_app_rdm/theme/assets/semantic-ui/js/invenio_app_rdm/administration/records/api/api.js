/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import { APIRoutes } from "./routes";
import { http } from "react-invenio-forms";

const deleteRecord = async (record, payload) => {
  const reason = payload["removal_reason"];
  payload["removal_reason"] = { id: reason };
  return await http.post(APIRoutes.delete(record), payload);
};

const restoreRecord = async (record) => {
  return await http.post(APIRoutes.restore(record));
};

export const RecordModerationApi = {
  deleteRecord: deleteRecord,
  restoreRecord: restoreRecord,
};
