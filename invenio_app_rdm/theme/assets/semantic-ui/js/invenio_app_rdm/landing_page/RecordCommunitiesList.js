// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { http, Image, withCancel } from "react-invenio-forms";
import { Container, Item, Message, Placeholder } from "semantic-ui-react";
import { RecordCommunitiesListModal } from "./RecordCommunitiesListModal";

const MAX_COMMUNITIES = 2;

export class RecordCommunitiesList extends Component {
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

  fetchRecordCommunities = async () => {
    const { recordCommunitySearchEndpoint } = this.props;
    return await http.get(recordCommunitySearchEndpoint, {
      headers: {
        Accept: "application/vnd.inveniordm.v1+json",
      },
    });
  };

  render() {
    const { recordCommunitySearchEndpoint, permissions } = this.props;
    const { communities, loading, error } = this.state;
    let Element = null;

    if (loading) {
      Element = (
        <Placeholder>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      );
    } else if (communities?.length === 0 && permissions.can_manage) {
      Element = (
        <Message info>
          {i18next.t("This record is not included in any communities yet.")}
        </Message>
      );
    } else if (communities?.length > 0) {
      const communityItems = communities?.slice(0, MAX_COMMUNITIES).map((community) => (
        <Item key={community.id}>
          <Image size="mini" src={community.links.logo} />
          <Item.Content verticalAlign="middle">
            <Item.Header as="a" size="small" href={community.links.self_html}>
              {community.metadata.title}
            </Item.Header>
          </Item.Content>
        </Item>
      ));

      Element = (
        <>
          <Item.Group>{communityItems}</Item.Group>

          {!loading && communities?.length > MAX_COMMUNITIES && (
            <Container align="center" className="mt-10">
              <RecordCommunitiesListModal
                totalCommunities={communities.length}
                recordCommunitySearchEndpoint={recordCommunitySearchEndpoint}
              />
            </Container>
          )}

          {error && <Message error>{error}</Message>}
        </>
      );
    }

    return Element;
  }
}

RecordCommunitiesList.propTypes = {
  recordCommunitySearchEndpoint: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
};
