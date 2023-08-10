// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Grid, Message, Segment } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class AccessRequestTimelineRead extends Component {
  render() {
    const { request } = this.props;
    const expirationDate = request.payload.secret_link_expiration;
    return (
      <>
        <Message
          icon="large edit outline"
          attached
          header={i18next.t("Access request")}
        />
        <Segment className="attached">
          <Grid>
            <Grid.Row>
              <Grid.Column width={2}>
                <strong>{i18next.t("Link expiration:")}</strong>
              </Grid.Column>
              <Grid.Column width={4}>
                <label>
                  {expirationDate === "" ? i18next.t("Never") : expirationDate}
                </label>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        <br />
        <br />
      </>
    );
  }
}

AccessRequestTimelineRead.propTypes = {
  request: PropTypes.object.isRequired,
};
