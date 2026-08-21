/*
 * SPDX-FileCopyrightText: 2023-2024 CERN.
 * SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Modal } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { ManageUserRolesForm } from "./ManageUserRolesForm";

const canManageRoles = (user) => {
  return Boolean(user.links?.groups);
};

export class ManageUserRoles extends Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: false };
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  handleSuccess = () => {
    const { successCallback } = this.props;
    this.closeModal();
    successCallback();
  };

  render() {
    const { user } = this.props;
    const { modalOpen } = this.state;
    if (!canManageRoles(user)) {
      return null;
    }

    return (
      <>
        <Dropdown.Item
          key="manage-user-roles"
          onClick={this.openModal}
          icon="id badge"
          text={i18next.t("Manage roles")}
        />
        <ActionModal modalOpen={modalOpen} resource={user}>
          <Modal.Header>{i18next.t("Manage roles")}</Modal.Header>
          {modalOpen && (
            <ManageUserRolesForm
              actionSuccessCallback={this.handleSuccess}
              actionCancelCallback={this.closeModal}
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
};
