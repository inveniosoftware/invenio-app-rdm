/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Icon } from "semantic-ui-react";
import { ActionModal } from "@js/invenio_administration";
import _isEmpty from "lodash/isEmpty";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { ViewRecentChanges } from "./ViewRecentChanges";
import { ViewJson } from "./ViewJson";

export class AuditLogActions extends Component {
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

    if (dataActionKey === "view_changes") {
      this.setState({
        modalOpen: true,
        modalHeader: i18next.t("Recent changes"),
        modalProps: {
          size: "large",
        },
        modalBody: (
          <ViewRecentChanges
            actionCancelCallback={this.closeModal}
            resource={resource}
          />
        ),
      });
    } else if (dataActionKey === "view_log") {
      this.setState({
        modalOpen: true,
        modalHeader: i18next.t("Audit Log Details"),
        modalProps: {
          size: "large",
        },
        modalBody: <ViewJson jsonData={resource} onCloseHandler={this.closeModal} />,
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

  render() {
    const { actions, Element, resource } = this.props;
    const { action } = resource;
    const { modalOpen, modalHeader, modalBody, modalProps } = this.state;
    let icon;
    return (
      <>
        {Object.entries(actions).map(([actionKey, actionConfig]) => {
          if (actionKey === "view_log") {
            icon = "eye";
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
          if (actionKey === "view_changes" && actionConfig.show_for.includes(action)) {
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

AuditLogActions.propTypes = {
  resource: PropTypes.object.isRequired,
  actions: PropTypes.shape({
    text: PropTypes.string.isRequired,
    payload_schema: PropTypes.object.isRequired,
    order: PropTypes.number.isRequired,
  }),
  Element: PropTypes.node,
};

AuditLogActions.defaultProps = {
  Element: Button,
  actions: undefined,
};
