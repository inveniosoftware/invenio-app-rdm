/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal, Icon, Dropdown } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import _isEmpty from "lodash/isEmpty";
import { ImpersonateUserForm } from "./ImpersonateUserForm";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ImpersonateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
    };
  }

  onModalTriggerClick = (e) => {
    const { user } = this.props;

    this.setState({
      modalOpen: true,
      modalHeader: i18next.t("Impersonate user"),
      modalBody: (
        <ImpersonateUserForm
          actionSuccessCallback={this.handleSuccess}
          actionCancelCallback={this.closeModal}
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
    this.setState({
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
    });
    successCallback();
  };

  render() {
    const { user } = this.props;
    const { modalOpen, modalHeader, modalBody } = this.state;
    return (
      <>
        <Dropdown.Item
          key="impersonate-user"
          onClick={this.onModalTriggerClick}
          icon
          fluid
          basic
          labelPosition="left"
        >
          <Icon name="spy" />
          Impersonate
        </Dropdown.Item>
        <ActionModal modalOpen={modalOpen} user={user}>
          {modalHeader && <Modal.Header>{modalHeader}</Modal.Header>}
          {!_isEmpty(modalBody) && modalBody}
        </ActionModal>
      </>
    );
  }
}

ImpersonateUser.propTypes = {
  user: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};

ImpersonateUser.defaultProps = {};
