/*
 * SPDX-FileCopyrightText: 2023-2024 CERN.
 * SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { withCancel, ErrorMessage } from "react-invenio-forms";
import { Form, Button, Modal, Message } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import { UserModerationApi } from "../users/api";

const selectionHasChanged = (initialRoleIds, selectedRoleIds) => {
  if (initialRoleIds.length !== selectedRoleIds.length) return true;
  const selectedRoleIdSet = new Set(selectedRoleIds);
  return initialRoleIds.some((roleId) => !selectedRoleIdSet.has(roleId));
};

export class ManageUserRolesForm extends Component {
  state = {
    loading: true,
    error: undefined,
    showUnmanagedRoles: false,
    confirmChanges: false,
    initialRoleIds: [],
    selectedRoleIds: [],
    roles: [],
  };

  componentDidMount() {
    this.fetchRoles();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  fetchRoles = async () => {
    const { user } = this.props;

    try {
      const { data = {} } = await UserModerationApi.userGroups(user);
      const assignedRoles = data.groups || [];
      const initialRoleIds = assignedRoles.map((role) => String(role.id));
      const roles = Array.from(
        new Map(
          [...assignedRoles, ...(data.available_groups || [])].map(
            ({ id, name, is_managed: isManaged }) => [
              String(id),
              {
                id: String(id),
                name: String(name || id),
                isManaged: Boolean(isManaged),
              },
            ]
          )
        ).values()
      );

      this.setState({
        initialRoleIds,
        selectedRoleIds: initialRoleIds,
        roles,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  };

  handleSubmit = async () => {
    const { confirmChanges, initialRoleIds, selectedRoleIds } = this.state;
    if (!selectionHasChanged(initialRoleIds, selectedRoleIds)) return;
    if (!confirmChanges) {
      this.setState({ confirmChanges: true });
      return;
    }

    const { addNotification } = this.context;
    const { actionSuccessCallback, user } = this.props;
    this.setState({ loading: true, error: undefined });

    try {
      this.cancellableAction = withCancel(
        UserModerationApi.setUserGroups(user, { groups: selectedRoleIds })
      );
      await this.cancellableAction.promise;

      addNotification({
        title: i18next.t("Success"),
        content: i18next.t("User roles were updated."),
        type: "success",
      });
      this.setState({ loading: false });
      actionSuccessCallback();
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  };

  render() {
    const {
      error,
      loading,
      showUnmanagedRoles,
      confirmChanges,
      initialRoleIds,
      selectedRoleIds,
      roles,
    } = this.state;
    const { actionCancelCallback } = this.props;
    const selectedRoleIdSet = new Set(selectedRoleIds);
    const roleOptions = roles
      .filter(
        (role) =>
          selectedRoleIdSet.has(role.id) ||
          (showUnmanagedRoles ? !role.isManaged : role.isManaged)
      )
      .map((role) => ({ key: role.id, text: role.name, value: role.id }))
      .sort((left, right) => left.text.localeCompare(right.text));

    return (
      <>
        <Modal.Content>
          {error && (
            <ErrorMessage
              header={i18next.t("Unable to manage user roles")}
              content={error}
              icon="exclamation"
              className="text-align-left"
              negative
            />
          )}
          <Message
            info={confirmChanges}
            warning={!confirmChanges}
            icon={confirmChanges ? "question circle" : "warning sign"}
            content={
              confirmChanges
                ? i18next.t("Are you sure you want to update this user's roles?")
                : i18next.t("Role changes may affect the user's permissions.")
            }
          />
          <Form>
            <Form.Checkbox
              toggle
              checked={showUnmanagedRoles}
              label={i18next.t("Show unmanaged roles only")}
              onChange={(_, data) =>
                this.setState({ showUnmanagedRoles: data.checked })
              }
            />
            <Form.Dropdown
              id="selected-role-ids"
              multiple
              clearable
              fluid
              search
              selection
              loading={loading}
              options={roleOptions}
              value={selectedRoleIds}
              onChange={(_, data) =>
                this.setState({
                  selectedRoleIds: data.value || [],
                  confirmChanges: false,
                })
              }
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={actionCancelCallback} floated="left">
            {i18next.t("Close")}
          </Button>
          <Button
            size="small"
            labelPosition="left"
            icon="check"
            color="green"
            content={
              confirmChanges
                ? i18next.t("Confirm role update")
                : i18next.t("Update roles")
            }
            onClick={this.handleSubmit}
            loading={loading}
            disabled={loading || !selectionHasChanged(initialRoleIds, selectedRoleIds)}
          />
        </Modal.Actions>
      </>
    );
  }
}

ManageUserRolesForm.propTypes = {
  user: PropTypes.object.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
};
