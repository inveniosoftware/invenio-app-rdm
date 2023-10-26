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
    const { record } = this.props;
    this.state = {
      recordParent: record.parent,
    };
  }

  handleRecordUpdate = (updatedRecord) => {
    this.setState({ recordParent: updatedRecord });
  };

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
    const { recordParent } = this.state;

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
          <Header as="h2" size="small" id="record-communities-header" className="mt-5">
            {i18next.t("Communities")}
          </Header>
        </Modal.Header>

        <RecordCommunitiesSearch
          recordCommunityEndpoint={recordCommunityEndpoint}
          successActionCallback={successActionCallback}
          permissions={permissions}
          recordParent={recordParent}
          updateRecordCallback={this.handleRecordUpdate}
        />

        <Modal.Actions>
          <Button onClick={handleOnClose}>{i18next.t("Close")}</Button>
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
  record: PropTypes.object.isRequired,
};

RecordCommunitiesListModal.defaultProps = {
  modalOpen: false,
  trigger: undefined,
};
