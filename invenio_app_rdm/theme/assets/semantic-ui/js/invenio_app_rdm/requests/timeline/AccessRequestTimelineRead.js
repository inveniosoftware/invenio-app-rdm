/*
 * SPDX-FileCopyrightText: 2023-2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Header, Segment } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { DateTime } from "luxon";

export class AccessRequestTimelineRead extends Component {
  render() {
    const {
      request: {
        updated,
        payload: { secret_link_expiration: secretLinkExpiration },
      },
    } = this.props;

    const expirationDate =
      parseInt(secretLinkExpiration) === 0
        ? i18next.t("Never")
        : DateTime.fromISO(updated)
            .plus({
              days: parseInt(secretLinkExpiration),
            })
            .toISODate();
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
          <strong>{i18next.t("Link expiration date:")} </strong>
          <label>{expirationDate}</label>
        </Segment>
      </>
    );
  }
}

AccessRequestTimelineRead.propTypes = {
  request: PropTypes.object.isRequired,
};
