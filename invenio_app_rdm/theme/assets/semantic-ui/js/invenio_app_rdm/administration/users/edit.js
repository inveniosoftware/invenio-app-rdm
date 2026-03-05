/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2026 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { NotificationController } from "@js/invenio_administration";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { ErrorMessage, http } from "react-invenio-forms";
import { Divider, Header, List, Segment } from "semantic-ui-react";
import { ManageUserRoles } from "../components/ManageUserRoles";
import { fetchUserRoleManagementState } from "./api";

const fetchUserInfo = async (userId) => {
  try {
    const response = await http.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    return {};
  }
};

const UserRoleItem = ({ role }) => {
  const { name, description, isManaged } = role;
  const icon = isManaged ? "address card" : "address book outline";
  const managedStatus = isManaged
    ? i18next.t("Managed role")
    : i18next.t("Unmanaged role");

  return (
    <List.Item>
      <List.Icon name={icon} />
      <List.Content>
        <List.Header>{name}</List.Header>
        <List.Description className="text-muted">{managedStatus}</List.Description>
        {description && (
          <List.Description className="text-muted">{description}</List.Description>
        )}
      </List.Content>
    </List.Item>
  );
};

const UserRolesList = ({ roles }) => {
  if (!roles.length) {
    return <List.Item>{i18next.t("No roles assigned.")}</List.Item>;
  }

  return roles.map((role) => <UserRoleItem key={role.id} role={role} />);
};

class UserEditEnhancements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      rolesError: undefined,
      rolesLoading: true,
      userInfo: {},
    };
  }

  componentDidMount() {
    this.fetchUserInfo();
    this.fetchUserRoles();
  }

  fetchUserInfo = async () => {
    const { userId } = this.props;
    const userInfo = await fetchUserInfo(userId);
    this.setState({ userInfo });
  };

  fetchUserRoles = async () => {
    const { userId } = this.props;
    this.setState({ rolesError: undefined, rolesLoading: true });

    try {
      const rolesState = await fetchUserRoleManagementState({ id: userId });
      this.setState({
        roles: rolesState.assignedRoles,
        rolesLoading: false,
      });
    } catch {
      this.setState({
        rolesError: true,
        rolesLoading: false,
      });
    }
  };

  render() {
    const { userId } = this.props;
    const { roles, rolesError, rolesLoading, userInfo } = this.state;
    const user = { id: userId };

    return (
      <>
        <Segment>
          <Header as="h3">{i18next.t("User information")}</Header>
          <List size="small">
            <List.Item>
              <List.Header>{i18next.t("Username")}</List.Header>
              <List.Description>{userInfo.username}</List.Description>
            </List.Item>
            <List.Item>
              <List.Header>{i18next.t("Email")}</List.Header>
              <List.Description>{userInfo.email}</List.Description>
            </List.Item>
          </List>
        </Segment>
        <Segment>
          <Header as="h2">{i18next.t("Role management")}</Header>
          <Header as="h3">{i18next.t("Current user roles")}</Header>
          {rolesError ? (
            <ErrorMessage
              header={i18next.t("Unable to load user roles")}
              content={i18next.t("Refresh the page or try again.")}
              icon="exclamation"
              className="text-align-left"
              negative
            />
          ) : (
            <List size="small">
              {rolesLoading ? (
                <List.Item>{i18next.t("Loading roles...")}</List.Item>
              ) : (
                <UserRolesList roles={roles} />
              )}
            </List>
          )}
          <Divider />
          <ManageUserRoles
            user={user}
            asDropdownItem={false}
            successCallback={this.fetchUserRoles}
          />
        </Segment>
      </>
    );
  }
}

export const initUserEditEnhancements = () => {
  const root = document.getElementById("invenio-users-edit-root");
  if (!root) {
    return;
  }

  const userId = root.dataset.userId;
  ReactDOM.render(
    <NotificationController>
      <UserEditEnhancements userId={userId} />
    </NotificationController>,
    root
  );
};

const roleShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  isManaged: PropTypes.bool.isRequired,
});

UserRoleItem.propTypes = {
  role: roleShape.isRequired,
};

UserRolesList.propTypes = {
  roles: PropTypes.arrayOf(roleShape).isRequired,
};

UserEditEnhancements.propTypes = {
  userId: PropTypes.string.isRequired,
};
