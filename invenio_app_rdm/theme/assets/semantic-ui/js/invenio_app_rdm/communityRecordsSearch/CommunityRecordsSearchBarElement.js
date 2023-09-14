// This file is part of Invenio
// Copyright (C) 2022 CERN.
//
// Invenio is free software; you can redistribute it and/or modify it under the
// terms of the MIT License; see LICENSE file for more details.

import { MultipleOptionsSearchBarRSK } from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import PropTypes from "prop-types";
import { CommunityRecordsSingleSearchBarElement } from "./CommunityRecordsSingleSearchBarElement";

export const CommunityRecordsSearchBarElement = ({ queryString, onInputChange }) => {
  const headerSearchbar = document.getElementById("header-search-bar");
  const searchbarOptions = headerSearchbar.dataset.options
    ? JSON.parse(headerSearchbar.dataset.options)
    : [];

  if (!_isEmpty(searchbarOptions)) {
    return (
      <MultipleOptionsSearchBarRSK
        options={searchbarOptions}
        onInputChange={onInputChange}
        queryString={queryString}
        placeholder={i18next.t("Search records...")}
      />
    );
  } else {
    // backwards compatibility
    return (
      <CommunityRecordsSingleSearchBarElement
        placeholder={i18next.t("Search records...")}
        queryString={queryString}
        onInputChange={onInputChange}
      />
    );
  }
};

CommunityRecordsSearchBarElement.propTypes = {
  queryString: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
};
