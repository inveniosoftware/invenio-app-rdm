// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { PendingCommunitiesModal } from "./PendingCommunitiesModal/PendingCommunitiesModal";
import { RecordCommunitySubmissionModal } from "./RecordCommunitySubmission/RecordCommunitySubmissionModal";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuccessIcon } from "@js/invenio_communities/members";

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

  handleSuccessAction = (data, text) => {
    const { actionSucceed } = this.props;
    this.setState({ actionFeedback: text, visibleSuccessAction: false });
    this.toggleSubmissionModal(false);
    this.togglePendingRequestsModal(false);
    this.setState({ visibleSuccessAction: true });

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
      recordCommunitySearchConfig,
      recordCommunityEndpoint,
      toggleManageCommunitiesModal,
      recordUserCommunitySearchConfig,
    } = this.props;

    return (
      <>
        <div className="flex align-items-baseline ml-auto rel-mr-1 green-color">
          {visibleSuccessAction && (
            <SuccessIcon
              timeOutDelay={5000}
              show={visibleSuccessAction}
              content={
                <div className="half-width sub header small text size truncated">
                  {actionFeedback}
                </div>
              }
            />
          )}
        </div>
        <Dropdown
          trigger={<Icon name="cog" color="grey" className="ml-0" />}
          className="manage-menu-dropdown"
          direction="left"
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
          recordCommunitySearchConfig={recordCommunitySearchConfig}
          recordUserCommunitySearchConfig={recordUserCommunitySearchConfig}
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
  recordCommunitySearchConfig: PropTypes.string.isRequired,
  recordUserCommunitySearchConfig: PropTypes.string.isRequired,
  toggleManageCommunitiesModal: PropTypes.func.isRequired,
  actionSucceed: PropTypes.func,
  searchConfig: PropTypes.object.isRequired,
};

CommunitiesManagementDropdown.defaultProps = {
  actionSucceed: undefined,
};
