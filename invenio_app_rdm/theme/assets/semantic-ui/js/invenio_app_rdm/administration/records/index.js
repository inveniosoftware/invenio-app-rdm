/*
 * SPDX-FileCopyrightText: 2023 CERN.
 * SPDX-License-Identifier: MIT
 */

import { initDefaultSearchComponents } from "@js/invenio_administration";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { NotificationController } from "@js/invenio_administration";
import { RecordResourceActions } from "./RecordResourceActions";
import { SearchResultItemLayout, RecordSearchLayout } from "./search";
import { RDMToggleComponent } from "../../search/components";

import { ContribSearchAppFacets } from "@js/invenio_search_ui/components";
import { parametrize } from "react-overridable";

const ContribSearchAppFacetsWithConfig = parametrize(ContribSearchAppFacets, {
  toggle: true,
});

const domContainer = document.getElementById("invenio-search-config");

const defaultComponents = initDefaultSearchComponents(domContainer);

const overridenComponents = {
  ...defaultComponents,
  "InvenioAdministration.SearchResultItem.layout": SearchResultItemLayout,
  "SearchApp.layout": RecordSearchLayout,
  "SearchApp.facets": ContribSearchAppFacetsWithConfig,
  "InvenioAdministration.ResourceActions": RecordResourceActions,
  "SearchFilters.Toggle.element": RDMToggleComponent,
};

createSearchAppInit(
  overridenComponents,
  true,
  "invenio-search-config",
  false,
  NotificationController
);
