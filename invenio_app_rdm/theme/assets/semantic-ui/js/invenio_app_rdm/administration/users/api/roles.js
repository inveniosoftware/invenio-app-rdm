/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2026 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { UserModerationApi } from "./api";

const _extractHits = (responseData) => {
  return responseData?.hits?.hits || [];
};

const _extractTotal = (responseData) => {
  return responseData?.hits?.total || 0;
};

const _extractAssignedRoles = (responseData) => {
  return responseData?.groups || [];
};

const _toRoleId = (role) => String(role.id);

const _toRole = (role, description, isManaged) => {
  return {
    id: _toRoleId(role),
    name: role.name,
    description: description,
    isManaged: isManaged,
  };
};

const _rolesById = (roles) => new Map(roles.map((role) => [_toRoleId(role), role]));

export const emptyUserRolesState = () => ({
  assignedRoles: [],
  initialRoleIds: [],
  roles: [],
});

const prepareUserRolesState = (assignedRoles, allRoles) => {
  const rolesById = _rolesById(allRoles);
  const roles = allRoles.map((role) =>
    _toRole(role, role.description, role.is_managed)
  );
  const roleIds = new Set(roles.map(_toRoleId));

  const userRoles = assignedRoles.map((role) => {
    const roleFromAllRoles = rolesById.get(_toRoleId(role));
    const description = roleFromAllRoles?.description;
    const isManaged = Boolean(roleFromAllRoles?.is_managed);
    return _toRole(role, description, isManaged);
  });
  userRoles.forEach((role) => {
    const roleId = _toRoleId(role);
    if (!roleIds.has(roleId)) {
      roles.push(role);
      roleIds.add(roleId);
    }
  });

  const initialRoleIds = userRoles.map(_toRoleId);

  return {
    assignedRoles: userRoles,
    initialRoleIds: initialRoleIds,
    roles: roles,
  };
};

const fetchAllRoles = async () => {
  const size = 100;
  let page = 1;
  let allRoles = [];

  let hasMore = true;
  while (hasMore) {
    const response = await UserModerationApi.groups({ size, page });
    const data = response?.data || {};
    const hits = _extractHits(data);
    allRoles = allRoles.concat(hits);

    if (!hits.length || allRoles.length >= _extractTotal(data)) {
      hasMore = false;
    } else {
      page += 1;
    }
  }

  return allRoles;
};

export const fetchAssignedUserRoles = async (user) => {
  const userRolesResponse = await UserModerationApi.userGroups(user);
  return _extractAssignedRoles(userRolesResponse?.data);
};

export const fetchUserRoleManagementState = async (user) => {
  const [assignedRoles, allRoles] = await Promise.all([
    fetchAssignedUserRoles(user),
    fetchAllRoles(),
  ]);
  return prepareUserRolesState(assignedRoles, allRoles);
};
