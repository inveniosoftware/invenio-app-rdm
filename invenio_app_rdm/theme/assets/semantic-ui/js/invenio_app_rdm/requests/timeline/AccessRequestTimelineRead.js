// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Header, Segment } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class AccessRequestTimelineRead extends Component {
  render() {
    const {
      request: {
        payload: { secret_link_expiration },
      },
    } = this.props;
    return (
      <>
        <Header
          size="big"
          icon="edit outline"
          attached="top"
          className="highlight"
          content={i18next.t("Access request")}
        />
        <Segment className="attached rel-mb-2">
          <strong>{i18next.t("Link expiration:")} </strong>
          <label>
            {secret_link_expiration ? i18next.t("Never") : secret_link_expiration}
          </label>
        </Segment>
      </>
    );
  }
}

AccessRequestTimelineRead.propTypes = {
  request: PropTypes.object.isRequired,
};
