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
import {
  InvenioAdministrationActionsApi,
  NotificationContext,
} from "@js/invenio_administration";
import * as Yup from "yup";
import { emptyUserRolesState, fetchUserRoleManagementState } from "../users/api";

const _hasSelectionChanged = (initialRoleIds, selectedRoleIds) => {
  if (initialRoleIds.length !== selectedRoleIds.length) {
    return true;
  }

  const initialSet = new Set(initialRoleIds);
  return selectedRoleIds.some((roleId) => !initialSet.has(roleId));
};

const _toRoleOption = (role) => ({
  "key": role.id,
  "text": role.name,
  "value": role.id,
  "data-managed": role.isManaged,
});

const _toSortedRoleOptions = (roles) =>
  roles.map(_toRoleOption).sort((left, right) => left.text.localeCompare(right.text));

const _filterRoleOptions = (options, query) => {
  const lowerQuery = query.toLowerCase();
  return options.filter((option) => option.text.toLowerCase().includes(lowerQuery));
};

const _getVisibleRoleOptions = (options, showUnmanagedRoles, selectedRoleIds = []) => {
  const selectedRoleIdSet = new Set(selectedRoleIds);

  return options.filter((option) => {
    if (selectedRoleIdSet.has(option.value)) {
      return true;
    }

    return showUnmanagedRoles ? !option["data-managed"] : option["data-managed"];
  });
};

export class ManageUserRolesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingRoles: true,
      error: undefined,
      showUnmanagedRoles: false,
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
    const { actionSuccessCallback, user } = this.props;
    const { rolesState } = this.state;
    const { initialRoleIds } = rolesState;

    const selectedRoleIds = values.selectedRoleIds || [];
    if (!_hasSelectionChanged(initialRoleIds, selectedRoleIds)) {
      return;
    }

    this.setState({ loading: true, error: undefined });

    try {
      const actionEndpoint =
        user.links?.actions?.manage_roles || user.links?.manage_roles;
      this.cancellableAction = withCancel(
        InvenioAdministrationActionsApi.resourceAction(actionEndpoint, {
          groups: selectedRoleIds,
        })
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
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  toggleUnmanagedRoles = (event, data) => {
    this.setState({ showUnmanagedRoles: data.checked });
  };

  render() {
    const { error, loading, loadingRoles, rolesState, showUnmanagedRoles } = this.state;
    const { initialRoleIds, roles } = rolesState;

    return (
      <Formik
        onSubmit={this.handleSubmit}
        initialValues={{ selectedRoleIds: initialRoleIds }}
        enableReinitialize
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={this.validationSchema}
      >
        {({ handleSubmit, values }) => {
          const selectedRoleIds = values.selectedRoleIds || [];
          const hasSelectionChanged = _hasSelectionChanged(
            initialRoleIds,
            selectedRoleIds
          );
          const roleOptions = _toSortedRoleOptions(roles);
          const visibleRoleOptions = _getVisibleRoleOptions(
            roleOptions,
            showUnmanagedRoles,
            selectedRoleIds
          );

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
                <Message warning>
                  <p>
                    <Icon name="warning sign" />
                    {i18next.t("Role changes may affect the user's permissions.")}
                  </p>
                </Message>
                <Form>
                  <Form.Field id="selected-role-ids">
                    <Form.Checkbox
                      toggle
                      checked={showUnmanagedRoles}
                      label={i18next.t("Show unmanaged roles only")}
                      onChange={this.toggleUnmanagedRoles}
                    />
                    <SelectField
                      key={showUnmanagedRoles ? "unmanaged-roles" : "managed-roles"}
                      multiple
                      clearable
                      loading={loadingRoles}
                      fieldPath="selectedRoleIds"
                      options={visibleRoleOptions}
                      search={_filterRoleOptions}
                    />
                    <ErrorLabel fieldPath="selectedRoleIds" />
                  </Form.Field>
                </Form>
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
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading || loadingRoles || !hasSelectionChanged}
                />
              </Modal.Actions>
            </>
          );
        }}
      </Formik>
    );
  }
}

ManageUserRolesForm.propTypes = {
  user: PropTypes.object.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
};
