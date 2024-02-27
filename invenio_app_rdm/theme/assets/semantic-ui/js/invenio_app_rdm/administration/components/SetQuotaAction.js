/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023-2024 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Icon, Checkbox } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import { SetQuotaForm } from "./SetQuotaForm";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class SetQuotaAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      setQuotaInBytes: false,
    };
  }

  onModalTriggerClick = (e, { payloadSchema, dataName, dataActionKey }) => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
      setQuotaInBytes: false,
    });
  };

  handleSuccess = () => {
    const { successCallback } = this.props;
    this.setState({ modalOpen: false });
    successCallback();
  };

  setQuotaValueInBytes = (event, data) => {
    const { checked } = data;
    this.setState({ setQuotaInBytes: checked });
  };

  render() {
    const { resource, apiUrl, headerText, isRecord } = this.props;
    const { modalOpen, setQuotaInBytes } = this.state;

    return (
      <>
        <Button
          key="set-quota"
          onClick={this.onModalTriggerClick}
          icon
          fluid
          basic
          labelPosition="left"
        >
          <Icon name="disk" />
          {i18next.t("Set Quota")}
        </Button>

        <ActionModal modalOpen={modalOpen} resource={resource}>
          <Modal.Header className="flex justify-space-between">
            <div>{headerText}</div>
            <div>
              <Checkbox
                toggle
                label={i18next.t("Set quota in bytes")}
                onChange={this.setQuotaValueInBytes}
              />
            </div>
          </Modal.Header>
          {!isRecord && (
            <Modal.Content>
              <p>
                <strong>{i18next.t("Note")}:</strong>{" "}
                {i18next.t(
                  "This is the default quota that will be applied to any NEW records created by this user – it will NOT update quota of existing records."
                )}
              </p>
            </Modal.Content>
          )}
          <SetQuotaForm
            actionSuccessCallback={this.handleSuccess}
            actionCancelCallback={this.closeModal}
            resource={resource}
            apiUrl={apiUrl}
            setQuotaInBytes={setQuotaInBytes}
          />
        </ActionModal>
      </>
    );
  }
}

SetQuotaAction.propTypes = {
  resource: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  apiUrl: PropTypes.string.isRequired,
  headerText: PropTypes.string.isRequired,
  isRecord: PropTypes.bool,
};

SetQuotaAction.defaultProps = {
  isRecord: false,
};
