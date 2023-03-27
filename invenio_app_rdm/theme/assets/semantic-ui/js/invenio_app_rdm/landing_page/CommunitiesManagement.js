// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { RecordCommunitiesList } from "./RecordCommunitiesList";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Header } from "semantic-ui-react";
import { CommunitiesManagmentDropdown } from "./CommunitiesManagmentDropdown";
import { http, withCancel } from "react-invenio-forms";

export class CommunitiesManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      communities: undefined,
      error: undefined,
    };
  }

  componentDidMount() {
    this.getCommunities();
  }

  componentWillUnmount() {
    this.cancellableFetchCommunities?.cancel();
  }

  fetchRecordCommunities = async () => {
    const { recordCommunitySearchEndpoint } = this.props;
    return await http.get(recordCommunitySearchEndpoint, {
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

  render() {
    const {
      recordCommunitySearchEndpoint,
      permissions,
      canManageRecord,
      userCommunitiesMemberships,
      recordCommunityEndpoint,
    } = this.props;
    const { communities, loading, error } = this.state;
    return (
      <>
        <Header as="h4" dividing className="flex full-width">
          {i18next.t("Communities")}
          {canManageRecord && (
            <CommunitiesManagmentDropdown
              actionSucceed={(communitySelected) => {
                if (
                  communitySelected.access.review_policy === "open" &&
                  userCommunitiesMemberships[communitySelected?.id]
                ) {
                  this.getCommunities();
                }
              }}
              userCommunitiesMemberships={userCommunitiesMemberships}
              recordCommunityEndpoint={recordCommunityEndpoint}
            />
          )}
        </Header>
        <RecordCommunitiesList
          recordCommunitySearchEndpoint={recordCommunitySearchEndpoint}
          permissions={permissions}
          communities={communities}
          error={error}
          loading={loading}
        />
      </>
    );
  }
}

CommunitiesManagement.propTypes = {
  recordCommunitySearchEndpoint: PropTypes.string.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  canManageRecord: PropTypes.bool.isRequired,
  userCommunitiesMemberships: PropTypes.object.isRequired,
};
