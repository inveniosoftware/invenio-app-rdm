/*
 * SPDX-FileCopyrightText: 2025 CERN.
 * SPDX-License-Identifier: MIT
 */

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
