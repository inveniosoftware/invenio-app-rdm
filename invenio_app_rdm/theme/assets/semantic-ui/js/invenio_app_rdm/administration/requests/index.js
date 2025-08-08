// This file is part of InvenioCommunities
// Copyright (C) 2025 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { RequestsSearchbarLayout } from "./RequestsSearchbarLayout";
import { SearchResultItem } from "./RequestsSearchResultItem";

const domContainer = document.getElementById("invenio-search-config");

const defaultComponents = initDefaultSearchComponents(domContainer);

const overridenComponents = {
  ...defaultComponents,
  "SearchApp.searchbarContainer": RequestsSearchbarLayout,
  "InvenioAdministration.SearchResultItem.layout": SearchResultItem,
};

createSearchAppInit(overridenComponents, true, "invenio-search-config", false);
