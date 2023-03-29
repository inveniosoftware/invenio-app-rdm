// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { PendingCommunitiesModal } from "./PendingCommunitiesModal/PendingCommunitiesModal";
import { RecordCommunitySubmissionModal } from "./RecordCommunitySubmission/RecordCommunitySubmissionModal";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Icon, Transition } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class CommunitiesManagementDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submissionModalOpen: false,
      pendingRequestModalOpen: false,
      visibleSuccessAction: false,
      actionFeedback: "",
    };
  }

  delayRemoveSuccessAction = () => {
    setTimeout(() => {
      this.setState({ visibleSuccessAction: false });
    }, 10000);
  };

  handleSuccessAction = (data, text) => {
    const { actionSucceed } = this.props;
    this.setState({ actionFeedback: text, visibleSuccessAction: true });
    this.delayRemoveSuccessAction();
    this.toggleSubmissionModal(false);
    this.togglePendingRequestsModal(false);

    actionSucceed();
  };

  toggleSubmissionModal = (value) => {
    this.setState({ submissionModalOpen: value });
  };
  togglePendingRequestsModal = (value) => {
    this.setState({ pendingRequestModalOpen: value });
  };

  render() {
    const {
      visibleSuccessAction,
      submissionModalOpen,
      actionFeedback,
      pendingRequestModalOpen,
    } = this.state;
    const {
      userCommunitiesMemberships,
      searchConfig,
      recordCommunityEndpoint,
      toggleManageCommunitiesModal,
    } = this.props;

    return (
      <>
        <div className="display-inline-block ml-auto rel-mr-1">
          <Transition visible={visibleSuccessAction} animation="scale" duration={1000}>
            <div className="green-color">
              <Icon name="check" />
              <p className="display-inline-block">{actionFeedback}</p>
            </div>
          </Transition>
        </div>
        <Dropdown
          trigger={<Icon name="cog" color="grey" className="ml-0" />}
          className="manage-menu-dropdown"
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text={i18next.t("Submit to community")}
              onClick={() => this.toggleSubmissionModal(true)}
              icon="plus"
            />
            <Dropdown.Item
              text={i18next.t("Pending submissions")}
              icon="comments outline"
              onClick={() => this.togglePendingRequestsModal(true)}
            />
            <Dropdown.Item
              text={i18next.t("Manage communities")}
              icon="settings"
              onClick={() => toggleManageCommunitiesModal(true)}
            />
          </Dropdown.Menu>
        </Dropdown>
        <RecordCommunitySubmissionModal
          modalOpen={submissionModalOpen}
          userCommunitiesMemberships={userCommunitiesMemberships}
          toggleModal={this.toggleSubmissionModal}
          handleSuccessAction={this.handleSuccessAction}
          recordCommunityEndpoint={recordCommunityEndpoint}
        />
        <PendingCommunitiesModal
          modalOpen={pendingRequestModalOpen}
          handleOnOpen={() => this.togglePendingRequestsModal(true)}
          handleOnClose={() => this.togglePendingRequestsModal(false)}
          successActionCallback={this.handleSuccessAction}
          searchConfig={searchConfig}
        />
      </>
    );
  }
}

CommunitiesManagementDropdown.propTypes = {
  userCommunitiesMemberships: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  toggleManageCommunitiesModal: PropTypes.func.isRequired,
  actionSucceed: PropTypes.func,
  searchConfig: PropTypes.object.isRequired,
};

CommunitiesManagementDropdown.defaultProps = {
  actionSucceed: undefined,
};
