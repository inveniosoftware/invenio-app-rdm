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
import _isEmpty from "lodash/isEmpty";
import { ManageUserRolesForm } from "./ManageUserRolesForm";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ManageUserRoles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
    };
  }

  onModalTriggerClick = () => {
    const { user } = this.props;
    this.setState({
      modalOpen: true,
      modalHeader: i18next.t("Manage user roles"),
      modalBody: (
        <ManageUserRolesForm
          actionCloseCallback={this.closeModal}
          actionSuccessCallback={this.handleSuccess}
          user={user}
        />
      ),
    });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
    });
  };

  handleSuccess = () => {
    const { successCallback } = this.props;
    this.closeModal();
    successCallback();
  };

  render() {
    const { user, asDropdownItem } = this.props;
    const { modalOpen, modalHeader, modalBody } = this.state;
    return (
      <>
        {asDropdownItem ? (
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
        ) : (
          <Button onClick={this.onModalTriggerClick} icon labelPosition="left" primary>
            <Icon name="id badge" />
            {i18next.t("Manage roles")}
          </Button>
        )}
        <ActionModal modalOpen={modalOpen} resource={user}>
          <>
            {modalHeader && <Modal.Header>{modalHeader}</Modal.Header>}
            {!_isEmpty(modalBody) && modalBody}
          </>
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
