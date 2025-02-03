/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023-2024 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import TombstoneForm from "./TombstoneForm";
import { CompareRevisions } from "./CompareRevisions";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Icon } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import _isEmpty from "lodash/isEmpty";
import { RestoreConfirmation } from "./RestoreConfirmation";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class RecordResourceActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      modalHeader: undefined,
      modalBody: undefined,
      modalProps: undefined,
    };
  }

  onModalTriggerClick = (e, { payloadSchema, dataName, dataActionKey }) => {
    const { resource } = this.props;

    if (dataActionKey === "compare") {
      this.setState({
        modalOpen: true,
        modalHeader: i18next.t("Compare revisions"),
        modalProps: {
          size: "large",
        },
        modalBody: (
          <CompareRevisions
            actionSuccessCallback={this.handleSuccess}
            actionCancelCallback={this.closeModal}
            resource={resource}
          />
        ),
      });
    }
    if (dataActionKey === "delete") {
      this.setState({
        modalOpen: true,
        modalHeader: i18next.t("Delete record"),
        modalProps: undefined, // default size
        modalBody: (
          <TombstoneForm
            actionSuccessCallback={this.handleSuccess}
            actionCancelCallback={this.closeModal}
            resource={resource}
          />
        ),
      });
    }
    if (dataActionKey === "restore") {
      this.setState({
        modalOpen: true,
        modalHeader: i18next.t("Restore record"),
        modalProps: undefined, // default size
        modalBody: (
          <RestoreConfirmation
            actionSuccessCallback={this.handleSuccess}
            actionCancelCallback={this.closeModal}
            resource={resource}
          />
        ),
      });
    }
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
    const { actions, Element, resource } = this.props;
    const { modalOpen, modalHeader, modalBody, modalProps } = this.state;
    let icon;
    return (
      <>
        {Object.entries(actions).map(([actionKey, actionConfig]) => {
          if (actionKey === "compare" && !resource.deletion_status.is_deleted) {
            icon = "file code outline";
            return (
              <Element
                key={actionKey}
                onClick={this.onModalTriggerClick}
                payloadSchema={actionConfig.payload_schema}
                dataName={actionConfig.text}
                dataActionKey={actionKey}
                icon={icon}
                fluid
                basic
                labelPosition="left"
              >
                {icon && <Icon name={icon} />}
                {actionConfig.text}...
              </Element>
            );
          }
          if (actionKey === "delete" && !resource.deletion_status.is_deleted) {
            icon = "trash alternate";
            return (
              <Element
                key={actionKey}
                onClick={this.onModalTriggerClick}
                payloadSchema={actionConfig.payload_schema}
                dataName={actionConfig.text}
                dataActionKey={actionKey}
                icon={icon}
                fluid
                basic
                labelPosition="left"
              >
                {icon && <Icon name={icon} />}
                {actionConfig.text}...
              </Element>
            );
          }
          if (actionKey === "restore" && resource.deletion_status.is_deleted) {
            icon = "undo";
            return (
              <Element
                key={actionKey}
                onClick={this.onModalTriggerClick}
                payloadSchema={actionConfig.payload_schema}
                dataName={actionConfig.text}
                dataActionKey={actionKey}
                icon={icon}
                fluid
                labelPosition="left"
              >
                {icon && <Icon name={icon} />}
                {actionConfig.text}...
              </Element>
            );
          }
          return null;
        })}
        <ActionModal modalOpen={modalOpen} resource={resource} modalProps={modalProps}>
          {modalHeader && <Modal.Header>{modalHeader}</Modal.Header>}
          {!_isEmpty(modalBody) && modalBody}
        </ActionModal>
      </>
    );
  }
}

RecordResourceActions.propTypes = {
  resource: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    text: PropTypes.string.isRequired,
    payload_schema: PropTypes.object.isRequired,
    order: PropTypes.number.isRequired,
  }),
  Element: PropTypes.node,
};

RecordResourceActions.defaultProps = {
  Element: Button,
  actions: undefined,
};
