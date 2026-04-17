/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
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

const activateUser = async (user) => {
  return await http.post(APIRoutes.activate(user));
};

const impersonateUser = async (user) => {
  return await http.post(APIRoutes.impersonate(user));
};

const userGroups = async (user) => {
  return await http.get(APIRoutes.userGroups(user));
};

const setGroupsForUser = async (user, groups) => {
  return await http.put(APIRoutes.setGroups(user), { groups });
};

const groups = async (params = {}) => {
  return await http.get(APIRoutes.groups(), { params });
};

export const UserModerationApi = {
  restoreUser: restoreUser,
  approveUser: approveUser,
  activateUser: activateUser,
  impersonateUser: impersonateUser,
  deactivateUser: deactivateUser,
  blockUser: blockUser,
  userGroups: userGroups,
  setGroupsForUser: setGroupsForUser,
  groups: groups,
};
