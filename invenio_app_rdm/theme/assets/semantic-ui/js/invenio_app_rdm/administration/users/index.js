// This file is part of InvenioCommunities
// Copyright (C) 2022 CERN.
// Copyright (C) 2026 KTH Royal Institute of Technology.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { NotificationController } from "@js/invenio_administration";
import { SearchResultItemLayout, UserSearchLayout } from "./search";
import { SearchFacets } from "@js/invenio_administration";
import { initUserEditEnhancements } from "./edit";

const initUsersSearch = () => {
  const domContainer = document.getElementById("invenio-search-config");
  if (!domContainer) return;

  const defaultComponents = initDefaultSearchComponents(domContainer);

  const overridenComponents = {
    ...defaultComponents,
    "InvenioAdministration.SearchResultItem.layout": SearchResultItemLayout,
    "SearchApp.layout": UserSearchLayout,
    "SearchApp.facets": SearchFacets,
  };

  createSearchAppInit(
    overridenComponents,
    true,
    "invenio-search-config",
    false,
    NotificationController
  );
};

const initUsersAdministration = () => {
  initUsersSearch();
  initUserEditEnhancements();
};

initUsersAdministration();
