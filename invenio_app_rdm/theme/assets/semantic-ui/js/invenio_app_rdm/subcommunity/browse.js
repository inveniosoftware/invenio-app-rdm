/*
 * This file is part of Invenio.
 * Copyright (C) 2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import ReactDOM from "react-dom";
import _get from "lodash/get";

import { CommunitiesCardGroup } from "@js/invenio_communities/community";

const subCommunitiesContainer = document.getElementById("subcommunities-container");
const domContainer = document.getElementById("invenio-browse-config");
const apiEndpoint = _get(domContainer.dataset, "apiEndpoint");

if (subCommunitiesContainer) {
  ReactDOM.render(
    <CommunitiesCardGroup
      fetchDataUrl={apiEndpoint}
      emptyMessage="There are no child communities."
      defaultLogo="/static/images/square-placeholder.png"
    />,
    subCommunitiesContainer
  );
}
