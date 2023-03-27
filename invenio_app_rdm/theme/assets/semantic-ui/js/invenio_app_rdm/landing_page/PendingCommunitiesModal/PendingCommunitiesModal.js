// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Header, Modal, Icon, Button } from "semantic-ui-react";
import { PendingCommunitiesSearch } from "./PendingCommunitiesSearch";

export class PendingCommunitiesModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
    };
  }

  handleOnClose = () => this.setState({ modalOpen: false });
  handleOnOpen = () => this.setState({ modalOpen: true });

  handleSuccessItemAction = () => {
    this.handleOnClose();
    window.location.reload();
  };
  render() {
    const { searchConfig } = this.props;
    const { modalOpen } = this.state;

    return (
      <Modal
        role="dialog"
        aria-labelledby="record-communities-header"
        id="community-selection-modal"
        closeIcon
        closeOnDimmerClick={false}
        open={modalOpen}
        onClose={this.handleOnClose}
        onOpen={this.handleOnOpen}
        trigger={
          <span aria-haspopup="dialog" aria-expanded={modalOpen}>
            <Icon name="comments outline" />
            {i18next.t("Pending communities")}
          </span>
        }
      >
        <Modal.Header>
          <Header as="h2" id="record-communities-header">
            {i18next.t("Pending communities")}
          </Header>
        </Modal.Header>

        <Modal.Content>
          <PendingCommunitiesSearch
            searchConfig={searchConfig}
            successActionCallback={this.handleSuccessItemAction}
          />
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={() => this.setState({ modalOpen: false })}>
            {i18next.t("Close")}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

PendingCommunitiesModal.propTypes = {
  searchConfig: PropTypes.object.isRequired,
};
