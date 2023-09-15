// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Icon, Modal, Tab, Container } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { LinksTab } from "./AccessLinks/LinksTab";
import { AccessRequestsTab } from "./AccessRequests/AccessRequestsTab";
import { AccessUsers } from "./AccessUsers/AccessUsers";

export class ShareModal extends Component {
  constructor(props) {
    super(props);
    const { record } = this.props;
    this.state = {
      record: record,
    };
  }

  handleRecordUpdate = (updatedRecord) => {
    this.setState({ record: updatedRecord });
  };

  panes = (record, accessLinksSearchConfig, permissions) => {
    const { handleClose } = this.props;
    return [
      {
        menuItem: { icon: "users", content: "People" },
        pane: (
          <Tab.Pane key="accessUsers" as={Container}>
            <AccessUsers
              record={record}
              handleClose={handleClose}
              permissions={permissions}
              successCallback={this.handleRecordUpdate}
            />
          </Tab.Pane>
        ),
      },

      {
        menuItem: { icon: "linkify", content: "Links" },
        pane: (
          <Tab.Pane key="accessLinks" as={Container}>
            <LinksTab
              record={record}
              accessLinksSearchConfig={accessLinksSearchConfig}
              handleClose={handleClose}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: { icon: "cog", content: "Access requests" },
        pane: (
          <Tab.Pane key="accessRequests" as={Container}>
            <AccessRequestsTab
              record={record}
              handleClose={handleClose}
              successCallback={this.handleRecordUpdate}
            />
          </Tab.Pane>
        ),
      },
    ];
  };

  render() {
    const { open, handleClose, accessLinksSearchConfig, permissions } = this.props;
    const { record } = this.state;
    return (
      <Modal
        open={open}
        closeIcon
        onClose={handleClose}
        className="share-modal"
        role="dialog"
        aria-labelledby="access-link-modal-header"
        aria-modal="true"
        tab-index="-1"
        size="large"
        closeOnDimmerClick={false}
      >
        <Modal.Header as="h2" id="access-link-modal-header">
          <Icon name="share square" />
          {i18next.t("Share access")}
        </Modal.Header>

        <Tab
          menu={{ secondary: true, pointing: true }}
          panes={this.panes(record, accessLinksSearchConfig, permissions)}
          renderActiveOnly={false}
        />
      </Modal>
    );
  }
}

ShareModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  accessLinksSearchConfig: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
};
