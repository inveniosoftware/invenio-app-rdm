/*
 * SPDX-FileCopyrightText: 2020-2022 CERN.
 * SPDX-FileCopyrightText: 2020-2021 Northwestern University.
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-FileCopyrightText: 2021 New York University.
 * SPDX-License-Identifier: MIT
 */

import { createSearchAppInit } from "@js/invenio_search_ui";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import {
  CommunityItem,
  ResultsGridItemTemplate,
  CommunitiesEmptySearchResults,
} from "@js/invenio_communities/community";
import { RDMRecordSearchBarElement } from "../search/components";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";
import {
  ContribSearchAppFacets,
  ContribBucketAggregationElement,
  ContribBucketAggregationValuesElement,
  ContribRangeFacetElement,
} from "@js/invenio_search_ui/components";
import { overrideStore, parametrize } from "react-overridable";

export const appName = "InvenioAppRdm.DashboardCommunities";

export const DashboardCommunitiesSearchLayout = DashboardSearchLayoutHOC({
  searchBarPlaceholder: i18next.t("Search in my communities..."),
  appName: appName,
  mineLabel: i18next.t("My communities"),
});

const DashboardResultViewWAppName = parametrize(DashboardResultView, {
  appName: appName,
});

export const defaultComponents = {
  [`${appName}.BucketAggregation.element`]: ContribBucketAggregationElement,
  [`${appName}.BucketAggregationValues.element`]: ContribBucketAggregationValuesElement,
  [`${appName}.RangeFacet.element`]: ContribRangeFacetElement,
  [`${appName}.EmptyResults.element`]: CommunitiesEmptySearchResults,
  [`${appName}.SearchApp.facets`]: ContribSearchAppFacets,
  [`${appName}.ResultsList.item`]: CommunityItem,
  [`${appName}.ResultsGrid.item`]: ResultsGridItemTemplate,
  [`${appName}.SearchApp.layout`]: DashboardCommunitiesSearchLayout,
  [`${appName}.SearchApp.results`]: DashboardResultViewWAppName,
  [`${appName}.SearchBar.element`]: RDMRecordSearchBarElement,
};
const overriddenComponents = overrideStore.getAll();

createSearchAppInit(
  { ...defaultComponents, ...overriddenComponents },
  true,
  "invenio-search-config",
  true
);
