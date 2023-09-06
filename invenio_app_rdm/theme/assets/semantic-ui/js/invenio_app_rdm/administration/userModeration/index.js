// This file is part of InvenioCommunities
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { UserModerationSearchLayout } from "./search";
import { parametrize } from "react-overridable";
import { NotificationController, BoolFormatter } from "@js/invenio_administration";
import { SearchResultItemLayout } from "./search";

const domContainer = document.getElementById("invenio-search-config");

const defaultComponents = initDefaultSearchComponents(domContainer);
const CustomBoolFormatter = parametrize(BoolFormatter, {
  icon: "star",
  color: "yellow",
});

const overridenComponents = {
  ...defaultComponents,
  "InvenioAdministration.BoolFormatter": CustomBoolFormatter,
  "InvenioAdministration.SearchResultItem.layout": SearchResultItemLayout,
  "SearchApp.layout": UserModerationSearchLayout,
};

createSearchAppInit(
  overridenComponents,
  true,
  "invenio-search-config",
  false,
  NotificationController
);
