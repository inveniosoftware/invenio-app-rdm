/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2026 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import ReactDOM from "react-dom";
import { NotificationController } from "@js/invenio_administration";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { http } from "react-invenio-forms";
import { ManageUserRoles } from "../components/ManageUserRoles";
import { UserModerationApi } from "./api";

const renderUserInfo = (user) => {
  const usernameEl = document.getElementById("invenio-user-username");
  const emailEl = document.getElementById("invenio-user-email");
  if (usernameEl) {
    usernameEl.textContent = user?.username || "";
  }
  if (emailEl) {
    emailEl.textContent = user?.email || "";
  }
};

const fetchUserInfo = async (userId) => {
  try {
    const response = await http.get(`/api/users/${userId}`);
    renderUserInfo(response.data);
  } catch (error) {
    renderUserInfo({});
  }
};

const createRoleItem = (role) => {
  const item = document.createElement("div");
  item.className = "item";

  const content = document.createElement("div");
  content.className = "content";

  const header = document.createElement("div");
  header.className = "header";
  header.textContent = role?.name || role?.id || "";
  content.appendChild(header);

  if (role?.description) {
    const description = document.createElement("div");
    description.className = "description";
    description.textContent = role.description;
    content.appendChild(description);
  }

  item.appendChild(content);
  return item;
};

const renderUserRoles = (roles) => {
  const rolesEl = document.getElementById("invenio-user-roles");
  if (!rolesEl) return;

  rolesEl.replaceChildren();

  const normalizedRoles = roles.filter((role) => role?.name || role?.id);

  if (!normalizedRoles.length) {
    rolesEl.appendChild(createRoleItem({ name: i18next.t("No roles assigned.") }));
    return;
  }

  normalizedRoles.forEach((role) => {
    rolesEl.appendChild(createRoleItem(role));
  });
};

const fetchUserRoles = async (user) => {
  try {
    const [userRolesResponse, groupsResponse] = await Promise.all([
      UserModerationApi.userGroups(user),
      UserModerationApi.groups(),
    ]);

    const userRoles = userRolesResponse?.data?.groups || [];
    const groups = groupsResponse?.data?.hits?.hits || [];
    const groupsById = new Map(
      groups.filter((group) => group?.id).map((group) => [String(group.id), group])
    );

    const rolesWithDescriptions = userRoles.map((role) => {
      const key = String(role?.id || "");
      const group = groupsById.get(key);
      return {
        ...role,
        description: group?.description,
      };
    });

    renderUserRoles(rolesWithDescriptions);
  } catch (error) {
    renderUserRoles([]);
  }
};

export const initUserEditEnhancements = () => {
  const root = document.getElementById("invenio-users-manage-roles-root");
  if (!root) {
    return;
  }

  const userId = root.dataset.userId;
  const user = { id: userId };
  ReactDOM.render(
    <NotificationController>
      <ManageUserRoles
        user={user}
        asDropdownItem={false}
        successCallback={() => fetchUserRoles(user)}
      />
    </NotificationController>,
    root
  );
  fetchUserInfo(userId);
  fetchUserRoles(user);
};
