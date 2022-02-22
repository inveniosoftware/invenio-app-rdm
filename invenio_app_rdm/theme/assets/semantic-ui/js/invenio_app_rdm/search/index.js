// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createSearchAppInit } from "@js/invenio_search_ui";
import { RequestToggleComponent } from "../user_dashboard/components/requests";
import {
  RDMBucketAggregationElement,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMRecordResultsGridItem,
  RDMRecordResultsListItem,
  RDMRecordSearchBarContainer,
  RDMRecordSearchBarElement,
  RDMCountComponent,
  RDMEmptyResults,
  RDMErrorComponent,
  RDMToggleComponent,
} from "./components";

const initSearchApp = createSearchAppInit({
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "ResultsGrid.item": RDMRecordResultsGridItem,
  "EmptyResults.element": RDMEmptyResults,
  "ResultsList.item": RDMRecordResultsListItem,
  "SearchApp.facets": RDMRecordFacets,
  "SearchApp.searchbarContainer": RDMRecordSearchBarContainer,
  "SearchBar.element": RDMRecordSearchBarElement,
  "Count.element": RDMCountComponent,
  "Error.element": RDMErrorComponent,
  "SearchFilters.ToggleComponent": RDMToggleComponent,
});
