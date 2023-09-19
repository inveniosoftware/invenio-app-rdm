// This file is part of InvenioCommunities
// Copyright (C) 2023 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

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
