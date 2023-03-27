// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, Icon, Transition, Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import {
  CommunitySelectionModalComponent,
  SubmitReviewModal,
} from "react-invenio-deposit";
import { http } from "react-invenio-forms";
import _isEmpty from "lodash/isEmpty";

export class CommunitiesManagmentDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      community: null,
      modalOpen: false,
      error: null,
      dropdownOpen: false,
      loading: false,
      visibleSucessAction: false,
      isConfirmModalOpen: false,
    };
  }

  changeSelectedCommunity = (community) => {
    this.setState({
      community: community,
      error: null,
    });
  };

  canDirectPublish = () => {
    const { community } = this.state;
    const { userCommunitiesMemberships } = this.props;
    const userMembership = userCommunitiesMemberships[community?.id];
    return userMembership && community?.access.review_policy === "open";
  };

  postRecordCommunities = async () => {
    const { recordCommunityEndpoint, actionSucceed } = this.props;
    const { community } = this.state;

    this.setState({
      loading: true,
      visibleSucessAction: false,
      error: null,
    });

    try {
      await http.post(recordCommunityEndpoint, {
        communities: [
          {
            id: community.id,
          },
        ],
      });
      this.setState({
        visibleSucessAction: true,
        modalOpen: false,
        isConfirmModalOpen: false,
      });
      this.delayRemoveSuccessAction();
      actionSucceed && actionSucceed(community);
    } catch (error) {
      this.setState({
        error: error.response.data.errors[0].message,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  delayRemoveSuccessAction = () => {
    setTimeout(() => {
      this.setState({ visibleSucessAction: false });
    }, 10000);
  };

  dropdownTrigger = () => {
    return (
      <span>
        <Icon name="cog" />
      </span>
    );
  };

  updateModalState = (value) => {
    this.setState({ modalOpen: value });
  };

  closeConfirmModal = () => this.setState({ isConfirmModalOpen: false });

  openConfirmModal = () => this.setState({ isConfirmModalOpen: true });

  // TODO FIXME: Use common error cmp.
  displayErrors = () => {
    const { error } = this.state;
    return error && <Message error>{error}</Message>;
  };

  render() {
    const {
      community,
      visibleSucessAction,
      dropdownOpen,
      modalOpen,
      isConfirmModalOpen,
      loading,
    } = this.state;
    const { userCommunitiesMemberships } = this.props;

    return (
      <>
        <div className="display-inline-block ml-auto">
          <Transition visible={visibleSucessAction} animation="scale" duration={1000}>
            <div className="green-color">
              <Icon name="check circle outline" />
              <p className="display-inline-block">
                {i18next.t("Succesfully submitted")}
              </p>
            </div>
          </Transition>
        </div>
        <Dropdown
          className="communities-manage-dropdown ml-auto mr-0 pr-0"
          multiple
          onClick={() => !modalOpen && this.setState({ dropdownOpen: !dropdownOpen })}
          onBlur={() => this.setState({ dropdownOpen: false })}
          trigger={this.dropdownTrigger()}
          open={dropdownOpen}
          pointing="top right"
        >
          <Dropdown.Menu>
            <CommunitySelectionModalComponent
              onCommunityChange={(community) => {
                this.changeSelectedCommunity(community);
                this.openConfirmModal();
              }}
              chosenCommunity={community}
              modalOpen={modalOpen}
              userCommunitiesMemberships={userCommunitiesMemberships}
              onModalChange={this.updateModalState}
              modalHeader={i18next.t("Select a community")}
              trigger={
                <Dropdown.Item
                  onClick={() => this.setState({ dropdownOpen: false })}
                  text={i18next.t("Submit to community")}
                />
              }
            />
            <Dropdown.Item text={i18next.t("Pending submissions")} />
          </Dropdown.Menu>
        </Dropdown>
        {isConfirmModalOpen && (
          <SubmitReviewModal
            loading={loading} //TODO FIXME: Implement loading in the reviewModal
            errors={this.displayErrors()}
            isConfirmModalOpen={isConfirmModalOpen}
            onSubmit={() => this.postRecordCommunities()}
            community={community}
            onClose={() => this.closeConfirmModal()}
            directPublish={this.canDirectPublish()}
          />
        )}
      </>
    );
  }
}

CommunitiesManagmentDropdown.propTypes = {
  userCommunitiesMemberships: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  actionSucceed: PropTypes.func,
};

CommunitiesManagmentDropdown.defaultProps = {
  actionSucceed: undefined,
};
