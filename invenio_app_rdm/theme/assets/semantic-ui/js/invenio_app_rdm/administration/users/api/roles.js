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

const _rolesById = (roles) => {
  const roleEntries = roles.map((role) => {
    const roleId = _toRoleId(role);
    return [roleId, role];
  });

  return new Map(roleEntries);
};

export const emptyUserRolesState = () => ({
  assignedRoles: [],
  initialManagedRoleIds: [],
  managedRoles: [],
  unmanagedAssignedRoleIds: [],
});

const prepareUserRolesState = (assignedRoles, allRoles) => {
  const rolesById = _rolesById(allRoles);
  const managedRoles = allRoles
    .filter((role) => role.is_managed)
    .map((role) => {
      return _toRole(role, role.description, true);
    });
  const managedRoleIds = managedRoles.map((role) => {
    return _toRoleId(role);
  });

  const userRoles = assignedRoles.map((role) => {
    const roleId = _toRoleId(role);
    const roleFromAllRoles = rolesById.get(roleId);
    const isManaged = managedRoleIds.includes(roleId);
    let description;
    if (roleFromAllRoles) {
      description = roleFromAllRoles.description;
    }

    return _toRole(role, description, isManaged);
  });

  const initialManagedRoleIds = [];
  const unmanagedAssignedRoleIds = [];
  userRoles.forEach((role) => {
    const roleId = _toRoleId(role);
    if (role.isManaged) {
      initialManagedRoleIds.push(roleId);
    } else {
      unmanagedAssignedRoleIds.push(roleId);
    }
  });

  return {
    assignedRoles: userRoles,
    initialManagedRoleIds: initialManagedRoleIds,
    managedRoles: managedRoles,
    unmanagedAssignedRoleIds: unmanagedAssignedRoleIds,
  };
};

const fetchAllRoles = async () => {
  const size = 100;
  let page = 1;
  let allRoles = [];
  let total = null;
  let shouldContinue = true;

  while (shouldContinue) {
    const response = await UserModerationApi.groups({
      size,
      page,
    });
    const data = response?.data || {};
    const hits = _extractHits(data);
    allRoles = allRoles.concat(hits);

    if (total === null) {
      total = _extractTotal(data);
    }

    shouldContinue = Boolean(hits.length) && allRoles.length < total;
    if (shouldContinue) {
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
