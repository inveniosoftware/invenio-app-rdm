// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { overrideStore } from "react-overridable";
import _ from "lodash";
import _truncate from "lodash/truncate";
import {
  RDMRecordResultsListItem,
  RDMRecordResultsGridItem,
  RDMRecordSearchBarElement,
} from "./search";

async function registerComponent(componentId, defaultComponent) {
  let component;
  try {
    const module = await import(
      /* webpackMode: "eager" */
      `../../templates/search/${componentId}.jsx`
    );
    component = module.default;
  } catch (error) {
    component = defaultComponent;
  } finally {
    overrideStore.add(componentId, component);
  }
}

const componentMapping = {
  "ResultsList.item": RDMRecordResultsListItem,
  "ResultsGrid.item": RDMRecordResultsGridItem,
  "SearchBar.element": RDMRecordSearchBarElement,
};

for (const [componentId, component] of Object.entries(componentMapping)) {
  registerComponent(componentId, component);
}
