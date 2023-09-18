/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import { APIRoutes } from "./routes";
import { http } from "react-invenio-forms";

const restoreUser = async (user) => {
  return await http.post(APIRoutes.restore(user));
};

const blockUser = async (user) => {
  return await http.post(APIRoutes.block(user));
};

const deactivateUser = async (user) => {
  return await http.post(APIRoutes.deactivate(user));
};

const approveUser = async (user) => {
  return await http.post(APIRoutes.approve(user));
};

export const UserModerationApi = {
  restoreUser: restoreUser,
  approveUser: approveUser,
  deactivateUser: deactivateUser,
  blockUser: blockUser,
};
