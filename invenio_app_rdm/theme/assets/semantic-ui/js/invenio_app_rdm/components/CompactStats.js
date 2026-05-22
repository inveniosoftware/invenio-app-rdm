/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import React from "react";
import { Icon, Label, Popup } from "semantic-ui-react";
import { localizedFormatNumber } from "../utils";

export const CompactStats = ({ uniqueViews, uniqueDownloads }) => {
  return (
    <>
      {uniqueViews != null && (
        <Popup
          size="tiny"
          content={i18next.t("Views")}
          trigger={
            <Label className="transparent">
              <Icon name="eye" />
              {localizedFormatNumber(uniqueViews)}
            </Label>
          }
        />
      )}
      {uniqueDownloads != null && (
        <Popup
          size="tiny"
          content={i18next.t("Downloads")}
          trigger={
            <Label className="transparent">
              <Icon name="download" />
              {localizedFormatNumber(uniqueDownloads)}
            </Label>
          }
        />
      )}
    </>
  );
};

CompactStats.propTypes = {
  uniqueViews: PropTypes.number,
  uniqueDownloads: PropTypes.number,
};

CompactStats.defaultProps = {
  uniqueViews: null,
  uniqueDownloads: null,
};
