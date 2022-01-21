/*
 * This file is part of Invenio.
 * Copyright (C) 2020-2021 CERN.
 * Copyright (C) 2020-2021 Northwestern University.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  RDMBucketAggregationElement,
  RDMCountComponent,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  RDMToggleComponent,
} from "../search/components";
import {
  RDMDepositResults,
  RDMEmptyResults,
  RDMRecordResultsGridItem,
  RDMRecordResultsListItem,
  RDMUserRecordsSearchLayout,
} from "./components";

createSearchAppInit(
  {
    "BucketAggregation.element": RDMBucketAggregationElement,
    "BucketAggregationValues.element": RDMRecordFacetsValues,
    "Count.element": RDMCountComponent,
    "EmptyResults.element": RDMEmptyResults,
    "ResultsList.item": RDMRecordResultsListItem,
    "ResultsGrid.item": RDMRecordResultsGridItem,
    "SearchApp.facets": RDMRecordFacets,
    "SearchApp.layout": RDMUserRecordsSearchLayout,
    "SearchApp.results": RDMDepositResults,
    "SearchBar.element": RDMRecordSearchBarElement,
    "BucketAggregation.element": RDMBucketAggregationElement,
    "BucketAggregationValues.element": RDMRecordFacetsValues,
    "SearchFilters.ToggleComponent": RDMToggleComponent,
  },
  true,
  "invenio-search-user-dashboard"
);
