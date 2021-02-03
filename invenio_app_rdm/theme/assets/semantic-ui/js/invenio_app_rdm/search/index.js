// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  RDMBucketAggregationElement,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMRecordResultsGridItem,
  RDMRecordResultsListItem,
  RDMRecordSearchBarContainer,
  RDMRecordSearchBarElement,
  RDMToggleComponent,
  RDMCountComponent,
} from "./components";

const initSearchApp = createSearchAppInit({
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "ResultsGrid.item": RDMRecordResultsGridItem,
  "ResultsList.item": RDMRecordResultsListItem,
  "SearchApp.facets": RDMRecordFacets,
  "SearchApp.searchbarContainer": RDMRecordSearchBarContainer,
  "SearchBar.element": RDMRecordSearchBarElement,
  "SearchFilters.ToggleComponent": RDMToggleComponent,
  "Count.element": RDMCountComponent,
});
