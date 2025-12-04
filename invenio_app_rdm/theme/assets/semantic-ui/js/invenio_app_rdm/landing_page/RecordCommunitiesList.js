// This file is part of InvenioRDM
// Copyright (C) 2023-2024 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Image } from "react-invenio-forms";
import {
  Grid,
  Item,
  Message,
  Popup,
  Placeholder,
  Header,
  HeaderSubheader,
  Icon,
} from "semantic-ui-react";

export class RecordCommunitiesList extends Component {
  render() {
    const { communities, loading, error, maxDisplayedCommunities, recordRequests } =
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
        .map((community) => {
          const viewRequest = community.id in recordRequests;
          return (
            <Grid key={community.id}>
              <Grid.Row verticalAlign="middle">
                <Grid.Column width={3}>
                  <Image wrapped size="mini" src={community.links.logo} alt="" />
                </Grid.Column>
                <Grid.Column width={13} className="pl-0">
                  <Item.Content>
                    <Item.Header className="ui">
                      <Header as="a" href={community.links.self_html} size="small">
                        {community.metadata.title}
                        {/* Show the icon for communities allowing children, and for subcommunities */}
                        {(community.children?.allow ||
                          community.parent !== undefined) && (
                          <p className="ml-5 display-inline-block">
                            <Popup
                              content="Verified community"
                              trigger={
                                <Icon
                                  size="small"
                                  color="green"
                                  name="check circle outline"
                                />
                              }
                              position="top center"
                            />
                          </p>
                        )}
                      </Header>
                      {community.parent && (
                        <HeaderSubheader>
                          {i18next.t("Part of")}{" "}
                          <a href={`/communities/${community.parent.slug}`}>
                            {i18next.t(community.parent.metadata.title)}
                          </a>
                        </HeaderSubheader>
                      )}
                      {viewRequest && (
                        <div>
                          <small>
                            <b>
                              <a
                                // building request link as the self_html of the request is
                                // /requests/<uuid> which doesn't resolve as missing
                                // /communities/ or /me/. We prefer /communities/ here
                                href={`${community.links.self_html}requests/${
                                  recordRequests[community.id]
                                }`}
                              >
                                <Icon name="discussions" className="mr-5" />
                                {i18next.t("View comments")}
                              </a>
                            </b>
                          </small>
                        </div>
                      )}
                    </Item.Header>
                  </Item.Content>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          );
        });

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
  recordRequests: PropTypes.object,
};

RecordCommunitiesList.defaultProps = {
  communities: undefined,
  loading: false,
  error: "",
  recordRequests: {},
};
