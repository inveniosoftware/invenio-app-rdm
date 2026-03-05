/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2023-2024 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Formik } from "formik";
import { withCancel, ErrorMessage, SelectField, ErrorLabel } from "react-invenio-forms";
import { Form, Button, Modal, Message, Icon } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import * as Yup from "yup";
import {
  emptyUserRolesState,
  fetchUserRoleManagementState,
  UserModerationApi,
} from "../users/api";

const _hasSelectionChanged = (initialManagedRoleIds, selectedRoleIds) => {
  if (initialManagedRoleIds.length !== selectedRoleIds.length) {
    return true;
  }

  const initialSet = new Set(initialManagedRoleIds);
  return selectedRoleIds.some((roleId) => !initialSet.has(roleId));
};

const _mergeSelectedRoleIds = (selectedRoleIds, unmanagedAssignedRoleIds) => {
  return Array.from(new Set([...selectedRoleIds, ...unmanagedAssignedRoleIds]));
};

const _toRoleOption = (role) => {
  return {
    key: role.id,
    text: role.name,
    value: role.id,
  };
};

const _toSortedRoleOptions = (roles) => {
  return roles
    .map((role) => {
      return _toRoleOption(role);
    })
    .sort((left, right) => {
      return left.text.localeCompare(right.text);
    });
};

export class ManageUserRolesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingRoles: true,
      error: undefined,
      rolesState: emptyUserRolesState(),
    };
    this.validationSchema = Yup.object({
      selectedRoleIds: Yup.array().of(Yup.string()),
    });
  }

  componentDidMount() {
    this.fetchRoles();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  fetchRoles = async () => {
    const { user } = this.props;
    this.setState({ loadingRoles: true, error: undefined });

    try {
      const rolesState = await fetchUserRoleManagementState(user);
      this.setState({
        loadingRoles: false,
        rolesState,
      });
    } catch (error) {
      this.setState({
        error: error?.response?.data?.message || error?.message,
        loadingRoles: false,
      });
    }
  };

  handleSubmit = async (values) => {
    const { addNotification } = this.context;
    const { user, actionSuccessCallback } = this.props;
    const { rolesState } = this.state;
    const { initialManagedRoleIds, unmanagedAssignedRoleIds } = rolesState;

    const selectedRoleIds = values.selectedRoleIds || [];
    if (!_hasSelectionChanged(initialManagedRoleIds, selectedRoleIds)) {
      return;
    }

    this.setState({ loading: true, error: undefined });

    try {
      const roleIdsToKeep = _mergeSelectedRoleIds(
        selectedRoleIds,
        unmanagedAssignedRoleIds
      );
      this.cancellableAction = withCancel(
        UserModerationApi.setGroupsForUser(user, roleIdsToKeep)
      );
      await this.cancellableAction.promise;

      addNotification({
        title: i18next.t("Success"),
        content: i18next.t("User roles were updated."),
        type: "success",
      });
      this.setState({ loading: false, error: undefined });
      actionSuccessCallback();
    } catch (error) {
      if (error === "UNMOUNTED") {
        return;
      }
      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      console.error(error);
    }
  };

  handleModalClose = () => {
    const { actionCloseCallback } = this.props;
    actionCloseCallback();
  };

  render() {
    const { error, loading, loadingRoles, rolesState } = this.state;
    const { assignedRoles, initialManagedRoleIds, managedRoles } = rolesState;
    const roleOptions = _toSortedRoleOptions(managedRoles);

    return (
      <Formik
        onSubmit={this.handleSubmit}
        initialValues={{ selectedRoleIds: initialManagedRoleIds }}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={() => this.validationSchema}
      >
        {({ handleSubmit }) => (
          <>
            {error && (
              <ErrorMessage
                header={i18next.t("Unable to manage user roles")}
                content={error}
                icon="exclamation"
                className="text-align-left"
                negative
              />
            )}
            <Modal.Content>
              <Message visible warning>
                <p>
                  <Icon name="warning sign" />
                  {i18next.t(
                    "Only managed roles can be changed here. Role changes may affect the user's permissions."
                  )}
                </p>
              </Message>
              <Form>
                <Form.Field id="selected-role-ids">
                  <SelectField
                    multiple
                    clearable
                    search
                    loading={loadingRoles}
                    fieldPath="selectedRoleIds"
                    options={roleOptions}
                  />
                  <ErrorLabel fieldPath="selectedRoleIds" />
                </Form.Field>
              </Form>
              <Message visible>
                <h3>{i18next.t("Current user roles")}</h3>
                <ul>
                  {assignedRoles.length > 0 ? (
                    assignedRoles.map((role) => (
                      <li key={role.id}>
                        <strong className={role.isManaged ? "" : "text-muted"}>
                          {role.name}
                        </strong>
                      </li>
                    ))
                  ) : (
                    <li>{i18next.t("No roles assigned.")}</li>
                  )}
                </ul>
              </Message>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={this.handleModalClose} floated="left">
                {i18next.t("Close")}
              </Button>
              <Button
                size="small"
                type="submit"
                labelPosition="left"
                icon="check"
                color="green"
                content={i18next.t("Update roles")}
                onClick={(event) => handleSubmit(event)}
                loading={loading}
                disabled={loading || loadingRoles}
              />
            </Modal.Actions>
          </>
        )}
      </Formik>
    );
  }
}

ManageUserRolesForm.propTypes = {
  user: PropTypes.object.isRequired,
  actionCloseCallback: PropTypes.func.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
};
