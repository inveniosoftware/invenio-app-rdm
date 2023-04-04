// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { RecordCommunitiesListModal } from "./RecordCommunitiesListModal";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { RecordCommunitiesList } from "./RecordCommunitiesList";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Header, Container, Button, Segment } from "semantic-ui-react";
import { CommunitiesManagementDropdown } from "./CommunitiesManagementDropdown";
import { http, withCancel } from "react-invenio-forms";

const MAX_COMMUNITIES = 2;

export class CommunitiesManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      communities: undefined,
      error: undefined,
      manageCommunitiesModalOpen: false,
    };
  }

  componentDidMount() {
    this.getCommunities();
  }

  componentWillUnmount() {
    this.cancellableFetchCommunities?.cancel();
  }

  toggleManageCommunitiesModal = (value) => {
    this.setState({ manageCommunitiesModalOpen: value });
  };

  fetchRecordCommunities = async () => {
    const { recordCommunityEndpoint } = this.props;
    return await http.get(recordCommunityEndpoint, {
      headers: {
        Accept: "application/vnd.inveniordm.v1+json",
      },
    });
  };

  getCommunities = async () => {
    this.cancellableFetchCommunities = withCancel(this.fetchRecordCommunities());
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const response = await this.cancellableFetchCommunities.promise;
      const {
        data: {
          hits: { hits },
        },
      } = response;
      this.setState({
        communities: hits,
        loading: false,
      });
    } catch (error) {
      if (error !== "UNMOUNTED") {
        this.setState({
          loading: false,
          error: i18next.t("An error occurred while fetching communities."),
        });
      }
    }
  };

  handleRefresh = () => {
    this.getCommunities();
    this.toggleManageCommunitiesModal(false);
  };

  render() {
    const {
      recordCommunitySearchConfig,
      permissions,
      canManageRecord,
      userCommunitiesMemberships,
      recordCommunityEndpoint,
      recordUserCommunitySearchConfig,
      searchConfig,
    } = this.props;
    const { communities, loading, error, manageCommunitiesModalOpen } = this.state;
    return (
      <>
        <Header size="medium" as="h3" className="flex" attached="top">
          {i18next.t("Communities")}
          {canManageRecord && (
            <CommunitiesManagementDropdown
              actionSucceed={this.handleRefresh}
              userCommunitiesMemberships={userCommunitiesMemberships}
              recordCommunityEndpoint={recordCommunityEndpoint}
              searchConfig={searchConfig}
              recordCommunitySearchConfig={recordCommunitySearchConfig}
              recordUserCommunitySearchConfig={recordUserCommunitySearchConfig}
              toggleManageCommunitiesModal={this.toggleManageCommunitiesModal}
            />
          )}
        </Header>
        <Segment attached="bottom">
          <RecordCommunitiesList
            permissions={permissions}
            communities={communities}
            error={error}
            loading={loading}
            maxDisplayedCommunities={MAX_COMMUNITIES}
          />
          <RecordCommunitiesListModal
            modalOpen={manageCommunitiesModalOpen}
            handleOnOpen={() => this.toggleManageCommunitiesModal(true)}
            handleOnClose={() => this.toggleManageCommunitiesModal(false)}
            successActionCallback={this.handleRefresh}
            recordCommunityEndpoint={recordCommunityEndpoint}
          />

          {!loading && communities?.length > MAX_COMMUNITIES && (
            <Container align="center" className="mt-10">
              <Button
                as="a"
                className="transparent link"
                aria-haspopup="dialog"
                aria-expanded={manageCommunitiesModalOpen}
                onClick={() => this.toggleManageCommunitiesModal(true)}
              >
                {i18next.t("View all")} {communities.length} {i18next.t("communities")}
              </Button>
            </Container>
          )}
        </Segment>
      </>
    );
  }
}

CommunitiesManagement.propTypes = {
  recordCommunitySearchConfig: PropTypes.string.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  recordUserCommunitySearchConfig: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  canManageRecord: PropTypes.bool.isRequired,
  userCommunitiesMemberships: PropTypes.object.isRequired,
  searchConfig: PropTypes.object.isRequired,
};
