// This file is part of InvenioRDM
// Copyright (C) 2023-2024 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Image } from "react-invenio-forms";
import { Item, Message, Popup, Placeholder, Header, Icon } from "semantic-ui-react";

export class RecordCommunitiesList extends Component {
  render() {
    const { communities, loading, error, maxDisplayedCommunities, branded } =
      this.props;
    let Element = null;

    if (loading) {
      Element = (
        <Placeholder>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          <Placeholder.Header image>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      );
    } else if (_isEmpty(communities)) {
      Element = (
        <p>
          <i>
            <small>
              {i18next.t("This record is not included in any communities yet.")}
            </small>
          </i>
        </p>
      );
    } else if (communities?.length > 0) {
      const communityItems = communities
        ?.slice(0, maxDisplayedCommunities)
        .map((community) => (
          <Item key={community.id}>
            <Image wrapped size="mini" src={community.links.logo} alt="" />
            <Item.Content verticalAlign="middle">
              <Item.Header as={Header}>
                <Header as="a" href={community.links.self_html} size="small">
                  {community.metadata.title}
                </Header>
                {community.id === branded && community?.theme && (
                  <p className="ml-5 display-inline-block">
                    <Popup
                      content="Verified community"
                      trigger={<Icon color="green" name="check circle outline" />}
                      position="top center"
                    />
                  </p>
                )}
              </Item.Header>
            </Item.Content>
          </Item>
        ));

      Element = (
        <>
          <Item.Group unstackable>{communityItems}</Item.Group>
          {error && <Message error>{error}</Message>}
        </>
      );
    }
    return Element;
  }
}

RecordCommunitiesList.propTypes = {
  maxDisplayedCommunities: PropTypes.number.isRequired,
  communities: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  branded: PropTypes.string,
};

RecordCommunitiesList.defaultProps = {
  communities: undefined,
  loading: false,
  error: "",
  branded: undefined,
};
