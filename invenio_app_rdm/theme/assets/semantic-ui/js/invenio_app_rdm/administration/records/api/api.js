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
  // WARNING: Axios does not accept payload without data key
  return await http.delete(APIRoutes.delete(record), {
    data: { ...payload },
    headers: { ...http.headers, if_match: record.revision_id },
  });
};

const restoreRecord = async (record) => {
  return await http.post(APIRoutes.restore(record));
};

const getRevisions = async (record) => {
  return await http.get(APIRoutes.compare(record));
};

export const RecordModerationApi = {
  deleteRecord: deleteRecord,
  restoreRecord: restoreRecord,
  getRevisions: getRevisions,
};
