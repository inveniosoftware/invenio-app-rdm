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
import { UserModerationApi } from "../users/api";

const _extractHits = (responseData) => {
  return responseData?.hits?.hits || [];
};

const _extractTotal = (responseData) => {
  return responseData?.hits?.total || 0;
};

const _extractAssignedRoles = (responseData) => {
  return responseData?.groups || [];
};

const _extractBackendError = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;
  const errors = error?.response?.data?.errors || [];
  const details = errors
    .map((item) => item?.message || item?.field || "")
    .filter((v) => v)
    .join("; ");

  if (status) {
    return details
      ? `${message} (HTTP ${status}) - ${details}`
      : `${message} (HTTP ${status})`;
  }
  return message;
};

const _toRoleId = (role) => String(role.id);

const _toRoleOption = (role, index) => {
  const roleId = _toRoleId(role);
  return {
    key: `${roleId}-${index}`,
    text: role.name,
    value: roleId,
  };
};

const _mergeRolesById = (assignedRoles, allRoles) => {
  const rolesById = new Map(allRoles.map((role) => [_toRoleId(role), role]));

  assignedRoles.forEach((role) => {
    const roleId = _toRoleId(role);
    if (!rolesById.has(roleId)) {
      rolesById.set(roleId, role);
    }
  });

  return rolesById;
};

const _prepareRolesState = (assignedRoles, allRoles) => {
  const rolesById = _mergeRolesById(assignedRoles, allRoles);
  const roles = Array.from(rolesById.values());
  const managedRoles = roles.filter((role) => role?.is_managed);
  const managedRoleIds = new Set(managedRoles.map(_toRoleId));
  const assignedRoleIds = assignedRoles.map(_toRoleId);

  return {
    assignedRoles: assignedRoles.map((role) => ({
      ...role,
      is_managed: rolesById.get(_toRoleId(role))?.is_managed,
    })),
    initialSelectedRoleIds: assignedRoleIds.filter((roleId) =>
      managedRoleIds.has(roleId)
    ),
    unmanagedAssignedRoleIds: assignedRoleIds.filter(
      (roleId) => !managedRoleIds.has(roleId)
    ),
    roleOptions: managedRoles
      .map(_toRoleOption)
      .sort((left, right) => left.text.localeCompare(right.text)),
  };
};

const _hasSelectionChanged = (initialSelectedRoleIds, selectedRoleIds) => {
  if (initialSelectedRoleIds.length !== selectedRoleIds.length) {
    return true;
  }

  const initialSet = new Set(initialSelectedRoleIds);
  return selectedRoleIds.some((roleId) => !initialSet.has(roleId));
};

const _mergeSelectedRoleIds = (selectedRoleIds, unmanagedAssignedRoleIds) => {
  return Array.from(new Set([...selectedRoleIds, ...unmanagedAssignedRoleIds]));
};

export class ManageUserRolesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingOptions: true,
      error: undefined,
      roleOptions: [],
      assignedRoles: [],
      initialSelectedRoleIds: [],
      unmanagedAssignedRoleIds: [],
    };
    this.validationSchema = Yup.object({
      selectedOptions: Yup.array().of(Yup.string()),
    });
  }

  componentDidMount() {
    this.fetchRoleOptions();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  fetchAllGroups = async () => {
    const size = 100;
    let page = 1;
    let allGroups = [];
    let total = null;
    let shouldContinue = true;

    while (shouldContinue) {
      const response = await UserModerationApi.groups({
        size,
        page,
      });
      const data = response?.data || {};
      const hits = _extractHits(data);
      allGroups = allGroups.concat(hits);

      if (total === null) {
        total = _extractTotal(data);
      }

      shouldContinue = Boolean(hits.length) && allGroups.length < total;
      if (shouldContinue) {
        page += 1;
      }
    }

    return allGroups;
  };

  fetchRoleOptions = async () => {
    const { user } = this.props;
    this.setState({ loadingOptions: true, error: undefined });

    try {
      const [userRolesResponse, allRoles] = await Promise.all([
        UserModerationApi.userGroups(user),
        this.fetchAllGroups(),
      ]);

      const assignedRoles = _extractAssignedRoles(userRolesResponse?.data);
      const rolesState = _prepareRolesState(assignedRoles, allRoles);

      this.setState({
        ...rolesState,
        loadingOptions: false,
      });
    } catch (error) {
      this.setState({
        error: _extractBackendError(error),
        loadingOptions: false,
      });
    }
  };

  handleSubmit = async (values) => {
    const { addNotification } = this.context;
    const { user, actionSuccessCallback } = this.props;
    const { initialSelectedRoleIds, unmanagedAssignedRoleIds } = this.state;

    const selectedOptions = values.selectedOptions || [];
    if (!_hasSelectionChanged(initialSelectedRoleIds, selectedOptions)) return;

    this.setState({ loading: true, error: undefined });

    try {
      const roleIdsToKeep = _mergeSelectedRoleIds(
        selectedOptions,
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
      if (error === "UNMOUNTED") return;
      this.setState({
        error: _extractBackendError(error),
        loading: false,
      });
    }
  };

  handleModalClose = () => {
    const { actionCloseCallback } = this.props;
    actionCloseCallback();
  };

  render() {
    const {
      assignedRoles,
      roleOptions,
      error,
      loading,
      loadingOptions,
      initialSelectedRoleIds,
    } = this.state;

    return (
      <Formik
        onSubmit={this.handleSubmit}
        initialValues={{ selectedOptions: initialSelectedRoleIds }}
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
                content={i18next.t(error)}
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
                    "Changing role memberships updates the user's administration permissions."
                  )}
                </p>
              </Message>
              <Form>
                <Form.Field id="selected-options">
                  <SelectField
                    multiple
                    clearable
                    search
                    loading={loadingOptions}
                    fieldPath="selectedOptions"
                    options={roleOptions}
                  />
                  <ErrorLabel fieldPath="selectedOptions" />
                </Form.Field>
              </Form>
              <Message visible>
                <h3>{i18next.t("Current user roles")}</h3>
                <ul>
                  {assignedRoles.length > 0 ? (
                    assignedRoles.map((role) => (
                      <li key={role.id}>
                        <strong className={role.is_managed ? "" : "text-muted"}>
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
                disabled={loading || loadingOptions}
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
