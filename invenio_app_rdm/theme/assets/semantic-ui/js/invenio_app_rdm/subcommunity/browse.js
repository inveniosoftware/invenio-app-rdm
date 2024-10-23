/*
 * This file is part of Invenio.
 * Copyright (C) 2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import ReactDOM from "react-dom";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";

import { CommunitiesCardGroup } from "@js/invenio_communities/community";

const subCommunitiesContainer = document.getElementById("subcommunities-container");
const apiEndpoint = _get(subCommunitiesContainer.dataset, "apiEndpoint");

if (subCommunitiesContainer) {
  ReactDOM.render(
    <CommunitiesCardGroup
      fetchDataUrl={`${apiEndpoint}?sort=oldest&page=1&size=5`}
      emptyMessage={i18next.t("This community has no subcommunities")}
      defaultLogo="/static/images/square-placeholder.png"
    />,
    subCommunitiesContainer
  );
}
