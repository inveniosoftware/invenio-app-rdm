/*
 * This file is part of Invenio.
 * Copyright (C) 2020 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  RDMRecordResultsListItem,
  RDMRecordResultsGridItem,
  RDMDepositResults,
  RDMEmptyResults,
} from "./components";
import {
  RDMBucketAggregationElement,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMToggleComponent,
} from "../../search/components";
import { RDMRecordSearchBarElement } from "../../search/components";

const initSearchApp = createSearchAppInit({
  "ResultsList.item": RDMRecordResultsListItem,
  "ResultsGrid.item": RDMRecordResultsGridItem,
  "SearchApp.results": RDMDepositResults,
  "SearchBar.element": RDMRecordSearchBarElement,
  "SearchApp.searchbar": () => null,
  "EmptyResults.element": RDMEmptyResults,
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "SearchFilters.ToggleComponent": RDMToggleComponent,
  "SearchApp.facets": RDMRecordFacets,

});
