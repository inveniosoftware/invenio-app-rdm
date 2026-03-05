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
import { Modal, Icon, Dropdown, Button } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import { ManageUserRolesForm } from "./ManageUserRolesForm";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ManageUserRoles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  onModalTriggerClick = () => {
    this.setState({
      modalOpen: true,
    });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
    });
  };

  handleSuccess = () => {
    const { successCallback } = this.props;
    this.closeModal();
    successCallback();
  };

  renderTrigger = () => {
    const { asDropdownItem } = this.props;

    if (asDropdownItem) {
      return (
        <Dropdown.Item
          key="manage-user-roles"
          onClick={this.onModalTriggerClick}
          icon
          fluid
          basic
          labelPosition="left"
        >
          <Icon name="id badge" />
          {i18next.t("Manage roles")}
        </Dropdown.Item>
      );
    }

    return (
      <Button
        onClick={this.onModalTriggerClick}
        icon
        labelPosition="left"
        primary
        size="small"
      >
        <Icon name="id badge" />
        {i18next.t("Manage roles")}
      </Button>
    );
  };

  render() {
    const { user } = this.props;
    const { modalOpen } = this.state;
    return (
      <>
        {this.renderTrigger()}
        <ActionModal modalOpen={modalOpen} resource={user}>
          <Modal.Header>{i18next.t("Manage user roles")}</Modal.Header>
          {modalOpen && (
            <ManageUserRolesForm
              actionCloseCallback={this.closeModal}
              actionSuccessCallback={this.handleSuccess}
              user={user}
            />
          )}
        </ActionModal>
      </>
    );
  }
}

ManageUserRoles.propTypes = {
  user: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  asDropdownItem: PropTypes.bool,
};

ManageUserRoles.defaultProps = {
  asDropdownItem: true,
};
