/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import { withState } from "react-searchkit";
import { Input } from "semantic-ui-react";

export const CommunityRecordsSingleSearchBarElement = withState(
  ({
    placeholder: passedPlaceholder,
    queryString,
    onInputChange,
    updateQueryState,
  }) => {
    const placeholder = passedPlaceholder || i18next.t("Search");
    const onBtnSearchClick = () => {
      updateQueryState({ queryString, filters: [] });
    };
    const onKeyPress = (event) => {
      if (event.key === "Enter") {
        updateQueryState({ queryString, filters: [] });
      }
    };
    return (
      <Input
        action={{
          "icon": "search",
          "onClick": onBtnSearchClick,
          "className": "search",
          "aria-label": i18next.t("Search"),
        }}
        fluid
        placeholder={placeholder}
        onChange={(event, { value }) => {
          onInputChange(value);
        }}
        value={queryString}
        onKeyPress={onKeyPress}
      />
    );
  }
);
