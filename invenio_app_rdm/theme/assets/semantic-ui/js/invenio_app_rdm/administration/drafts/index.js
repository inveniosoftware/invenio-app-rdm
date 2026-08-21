/*
 * SPDX-FileCopyrightText: 2023 CERN.
 * SPDX-License-Identifier: MIT
 */

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { NotificationController } from "@js/invenio_administration";
import { RecordResourceActions } from "../records/RecordResourceActions";
import { SearchResultItemLayout } from "../records/search";
import { SearchFacets } from "@js/invenio_administration";

const domContainer = document.getElementById("invenio-search-config");

const defaultComponents = initDefaultSearchComponents(domContainer);

const overridenComponents = {
  ...defaultComponents,
  "InvenioAdministration.SearchResultItem.layout": SearchResultItemLayout,
  // "SearchApp.layout": RecordSearchLayout,
  "SearchApp.facets": SearchFacets,
  "InvenioAdministration.ResourceActions": RecordResourceActions,
};

createSearchAppInit(
  overridenComponents,
  true,
  "invenio-search-config",
  false,
  NotificationController
);
