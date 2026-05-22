/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { UserModerationSearchLayout } from "./search";
import { NotificationController } from "@js/invenio_administration";
import { SearchResultItemLayout } from "./search";

const domContainer = document.getElementById("invenio-search-config");

const defaultComponents = initDefaultSearchComponents(domContainer);

const overridenComponents = {
  ...defaultComponents,
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
