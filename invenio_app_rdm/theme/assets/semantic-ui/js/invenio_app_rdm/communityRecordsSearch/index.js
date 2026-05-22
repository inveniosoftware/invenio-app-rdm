/*
 * SPDX-FileCopyrightText: 2022-2024 CERN.
 * SPDX-FileCopyrightText: 2024 Northwestern University.
 * SPDX-License-Identifier: MIT
 */

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  RDMCountComponent,
  RDMEmptyResults,
  RDMErrorComponent,
  RDMRecordResultsGridItem,
  RDMToggleComponent,
} from "../search/components";
import RecordsResultsListItem from "../components/RecordsResultsListItem";
import {
  CommunityRecordsSearchAppLayout,
  CommunityRecordsSearchBarElement,
} from "./components";
import { parametrize, overrideStore } from "react-overridable";
import {
  ContribSearchAppFacets,
  ContribBucketAggregationElement,
  ContribBucketAggregationValuesElement,
  ContribRangeFacetElement,
} from "@js/invenio_search_ui/components";

const appName = "InvenioCommunities.DetailsSearch";

const ContribSearchAppFacetsWithConfig = parametrize(ContribSearchAppFacets, {
  toggle: true,
});

const CommunityRecordSearchAppLayoutWAppName = parametrize(
  CommunityRecordsSearchAppLayout,
  {
    appName: appName,
  }
);

const CommunityRecordsResultsListItem = parametrize(RecordsResultsListItem, {
  appName: appName,
});

const defaultComponents = {
  [`${appName}.BucketAggregation.element`]: ContribBucketAggregationElement,
  [`${appName}.BucketAggregationValues.element`]: ContribBucketAggregationValuesElement,
  [`${appName}.RangeFacet.element`]: ContribRangeFacetElement,
  [`${appName}.ResultsGrid.item`]: RDMRecordResultsGridItem,
  [`${appName}.EmptyResults.element`]: RDMEmptyResults,
  [`${appName}.ResultsList.item`]: CommunityRecordsResultsListItem,
  [`${appName}.SearchApp.facets`]: ContribSearchAppFacetsWithConfig,
  [`${appName}.SearchApp.layout`]: CommunityRecordSearchAppLayoutWAppName,
  [`${appName}.SearchBar.element`]: CommunityRecordsSearchBarElement,
  [`${appName}.Count.element`]: RDMCountComponent,
  [`${appName}.Error.element`]: RDMErrorComponent,
  [`${appName}.SearchFilters.Toggle.element`]: RDMToggleComponent,
};

const overriddenComponents = overrideStore.getAll();

createSearchAppInit(
  { ...defaultComponents, ...overriddenComponents },
  true,
  "invenio-search-config",
  true
);
