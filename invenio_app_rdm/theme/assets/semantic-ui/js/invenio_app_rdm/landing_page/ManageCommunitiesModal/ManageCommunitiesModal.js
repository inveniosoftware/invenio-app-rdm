// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Header, Modal, Button, Icon, Grid } from "semantic-ui-react";
import { RecordCommunitiesSearch } from "../RecordCommunitiesListModal/RecordCommunitiesSearch";

export class ManageCommunitiesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
  }

  handleClose = () => {
    this.setState({ modalOpen: false });
    // TODO: remove after decision with reload component on landing page
    window.location.reload();
  };

  render() {
    const { recordCommunitySearchEndpoint, record } = this.props;
    const { modalOpen } = this.state;

    return (
      <Modal
        role="dialog"
        aria-labelledby="manage-communities-modal"
        id="manage-communities-modal"
        closeOnDimmerClick={false}
        open={modalOpen}
        onOpen={() => this.setState({ modalOpen: true })}
        trigger={
          <span aria-haspopup="dialog" aria-expanded={modalOpen}>
            <Icon name="settings" />
            {i18next.t("Manage communities")}
          </span>
        }
      >
        <Modal.Header>
          <Header as="h2" id="record-communities-header">
            {i18next.t("Communities")}
          </Header>
        </Modal.Header>

        <Modal.Content>
          <RecordCommunitiesSearch
            recordCommunitySearchEndpoint={recordCommunitySearchEndpoint}
            record={record}
          />
        </Modal.Content>
        <Modal.Actions>
          <Grid columns={2}>
            <Grid.Column>
              <Button floated="left" onClick={() => this.handleClose()}>
                {i18next.t("Close")}
              </Button>
            </Grid.Column>
          </Grid>
        </Modal.Actions>
      </Modal>
    );
  }
}

ManageCommunitiesModal.propTypes = {
  recordCommunitySearchEndpoint: PropTypes.string.isRequired,
  record: PropTypes.object.isRequired,
};
