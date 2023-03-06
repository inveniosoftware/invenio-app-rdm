// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Header, Modal, Button } from "semantic-ui-react";
import { RecordCommunitiesSearch } from "./RecordCommunitiesSearch";

export class RecordCommunitiesListModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
    };
  }

  render() {
    const { recordCommunitySearchEndpoint, totalCommunities } = this.props;
    const { modalOpen } = this.state;

    return (
      <Modal
        role="dialog"
        aria-labelledby="record-communities-header"
        id="community-selection-modal"
        closeIcon
        closeOnDimmerClick={false}
        open={modalOpen}
        onClose={() => this.setState({ modalOpen: false })}
        onOpen={() => this.setState({ modalOpen: true })}
        trigger={
          <Button
            as="a"
            className="transparent link"
            aria-haspopup="dialog"
            aria-expanded={modalOpen}
          >
            {i18next.t("View all")} {totalCommunities} {i18next.t("communities")}
          </Button>
        }
      >
        <Modal.Header>
          <Header as="h2" id="record-communities-header">
            {i18next.t("This record's communities")}
          </Header>
        </Modal.Header>

        <Modal.Content>
          <RecordCommunitiesSearch
            recordCommunitySearchEndpoint={recordCommunitySearchEndpoint}
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

RecordCommunitiesListModal.propTypes = {
  recordCommunitySearchEndpoint: PropTypes.string.isRequired,
  totalCommunities: PropTypes.number.isRequired,
};
