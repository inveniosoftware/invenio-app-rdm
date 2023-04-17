// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Header, Modal, Button, Grid } from "semantic-ui-react";
import { RecordCommunitiesSearch } from "./RecordCommunitiesSearch";

export class RecordCommunitiesListModal extends Component {
  render() {
    const {
      recordCommunityEndpoint,
      modalOpen,
      successActionCallback,
      handleOnOpen,
      handleOnClose,
      trigger,
      permissions,
    } = this.props;

    return (
      <Modal
        role="dialog"
        aria-labelledby="record-communities-header"
        id="community-selection-modal"
        closeOnDimmerClick={false}
        closeIcon
        open={modalOpen}
        onClose={handleOnClose}
        onOpen={handleOnOpen}
        trigger={trigger}
      >
        <Modal.Header>
          <Header as="h2" id="record-communities-header">
            {i18next.t("Communities")}
          </Header>
        </Modal.Header>

        <Modal.Content>
          <RecordCommunitiesSearch
            recordCommunityEndpoint={recordCommunityEndpoint}
            successActionCallback={successActionCallback}
            permissions={permissions}
          />
        </Modal.Content>

        <Modal.Actions>
          <Grid columns={2}>
            <Grid.Column>
              <Button floated="left" onClick={handleOnClose}>
                {i18next.t("Close")}
              </Button>
            </Grid.Column>
          </Grid>
        </Modal.Actions>
      </Modal>
    );
  }
}

RecordCommunitiesListModal.propTypes = {
  recordCommunityEndpoint: PropTypes.string.isRequired,
  trigger: PropTypes.object,
  modalOpen: PropTypes.bool,
  successActionCallback: PropTypes.func.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  handleOnOpen: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
};

RecordCommunitiesListModal.defaultProps = {
  modalOpen: false,
  trigger: undefined,
};
