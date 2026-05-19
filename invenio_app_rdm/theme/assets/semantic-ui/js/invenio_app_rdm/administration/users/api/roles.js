/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2026 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { UserModerationApi } from "./api";

const _extractAssignedRoles = (responseData) => {
  return responseData?.groups || [];
};

const _extractAvailableRoles = (responseData) => {
  return responseData?.available_groups || [];
};

const _toRoleId = (role) => String(role.id);

const _toRole = (role) => {
  return {
    id: _toRoleId(role),
    name: role.name,
    description: role.description,
    isManaged: Boolean(role.is_managed),
  };
};

const _rolesById = (roles) => new Map(roles.map((role) => [_toRoleId(role), role]));

export const emptyUserRolesState = () => ({
  initialRoleIds: [],
  roles: [],
});

const prepareUserRolesState = (assignedRoles, availableRoles) => {
  const availableRolesById = _rolesById(availableRoles);
  const roles = availableRoles.map(_toRole);
  const roleIds = new Set(roles.map(_toRoleId));

  const assignedRoleIds = assignedRoles.map(_toRoleId);
  assignedRoles.forEach((role) => {
    const roleId = _toRoleId(role);
    if (!roleIds.has(roleId)) {
      roles.push(_toRole({ ...role, ...availableRolesById.get(roleId) }));
      roleIds.add(roleId);
    }
  });

  return {
    initialRoleIds: assignedRoleIds,
    roles: roles,
  };
};

export const fetchUserRoleManagementState = async (user) => {
  const userRolesResponse = await UserModerationApi.userGroups(user);
  const responseData = userRolesResponse?.data || {};
  return prepareUserRolesState(
    _extractAssignedRoles(responseData),
    _extractAvailableRoles(responseData)
  );
};
