/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Icon } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import _isEmpty from "lodash/isEmpty";
import { SetQuotaForm } from "./SetQuotaForm";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class SetQuotaAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
    };
  }

  onModalTriggerClick = (e, { payloadSchema, dataName, dataActionKey }) => {
    const { resource, apiUrl } = this.props;

    this.setState({
      modalOpen: true,
      modalHeader: i18next.t("Set quota"),
      modalBody: (
        <SetQuotaForm
          actionSuccessCallback={this.handleSuccess}
          actionCancelCallback={this.closeModal}
          resource={resource}
          apiUrl={apiUrl}
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
    const { resource } = this.props;
    const { modalOpen, modalHeader, modalBody } = this.state;
    return (
      <>
        <Button
          key="set-quota"
          onClick={this.onModalTriggerClick}
          icon
          fluid
          labelPosition="left"
        >
          <Icon name="disk" />
          Set quota
        </Button>
        );
        <ActionModal modalOpen={modalOpen} resource={resource}>
          {modalHeader && <Modal.Header>{modalHeader}</Modal.Header>}
          {!_isEmpty(modalBody) && modalBody}
        </ActionModal>
      </>
    );
  }
}

SetQuotaAction.propTypes = {
  resource: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  apiUrl: PropTypes.string.isRequired,
};

SetQuotaAction.defaultProps = {};
