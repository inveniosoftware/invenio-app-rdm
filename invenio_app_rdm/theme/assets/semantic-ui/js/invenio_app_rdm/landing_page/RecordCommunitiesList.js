// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withCancel } from "react-invenio-forms";
import { Container, Item, Placeholder, Message } from "semantic-ui-react";
import { Image } from "react-invenio-forms";
import { RecordCommunitiesListModal } from "./RecordCommunitiesListModal/RecordCommunitiesListModal";
import { http } from "react-invenio-forms";

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
    const { recordCommunitySearchEndpoint } = this.props;
    const { communities, loading, error } = this.state;
    const communityItems = communities?.slice(0, 2).map((community) => {
      return (
        <Item key={community.id}>
          <Image size="mini" src={community.links.logo} />
          <Item.Content verticalAlign="middle">
            <Item.Header
              as="a"
              href={community.links.self_html}
              className="ui small header"
            >
              {community.metadata.title}
            </Item.Header>
          </Item.Content>
        </Item>
      );
    });

    return (
      <>
        {(loading && (
          <Placeholder>
            <Placeholder.Header image>
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Header>
          </Placeholder>
        )) || <Item.Group>{communityItems}</Item.Group>}

        {!loading && communities?.length > 3 && (
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
}

RecordCommunitiesList.propTypes = {
  recordCommunitySearchEndpoint: PropTypes.string.isRequired,
};
