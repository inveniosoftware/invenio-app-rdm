// This file is part of InvenioRDM
// Copyright (C) 2020-2023 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  ContribBucketAggregationElement,
  ContribBucketAggregationValuesElement,
  ContribSearchAppFacets,
  ContribRangeFacetElement,
} from "@js/invenio_search_ui/components";
import PropTypes from "prop-types";
import React from "react";
import { overrideStore, parametrize } from "react-overridable";
import { withState } from "react-searchkit";
import { Icon } from "semantic-ui-react";
import { defaultContribComponents } from "@js/invenio_requests/contrib";
import { RDMRecordSearchBarElement } from "../search/components";
import {
  MobileRequestItem,
  ComputerTabletRequestItem,
  RequestsSearchLayout,
  RequestsEmptyResultsWithState,
  RequestsResults,
} from "@js/invenio_requests/search";

const appName = "InvenioAppRdm.DashboardRequests";

export function RequestsResultsItemTemplateDashboard({ result }) {
  const ComputerTabletRequestsItemWithState = withState(ComputerTabletRequestItem);
  const MobileRequestsItemWithState = withState(MobileRequestItem);
  let detailsURL;
  if (result.type === "user-access-request") {
    detailsURL = `/access/requests/${result.id}`;
  } else {
    detailsURL = `/me/requests/${result.id}`;
  }
  return (
    <>
      <ComputerTabletRequestsItemWithState result={result} detailsURL={detailsURL} />
      <MobileRequestsItemWithState result={result} detailsURL={detailsURL} />
    </>
  );
}

RequestsResultsItemTemplateDashboard.propTypes = {
  result: PropTypes.object.isRequired,
};

const RequestsSearchLayoutWithApp = parametrize(RequestsSearchLayout, {
  appName: appName,
  showSharedFilters: true,
});

/**
 * This component is used to override the icon of a membership
 * request. For now it's placed here rather than like others in
 * invenio-requests/invenio_requests/assets/semantic-ui/js/invenio_requests/
 * contrib/Icons.js bc that repository shouldn't know about specific
 * request implementations in the first place. It's ideal location might be
 * in invenio-communities, but because of simple implementation, development
 * order and low cost of repeating, it's here for now. It can eventually be
 * moved.
 */
function CommunityMembershipRequestIcon() {
  return <Icon name="user plus" className="neutral" />;
}

export const defaultComponents = {
  [`${appName}.BucketAggregation.element`]: ContribBucketAggregationElement,
  [`${appName}.BucketAggregationValues.element`]: ContribBucketAggregationValuesElement,
  [`${appName}.RangeFacet.element`]: ContribRangeFacetElement,
  [`${appName}.SearchApp.facets`]: ContribSearchAppFacets,
  [`${appName}.ResultsList.item`]: RequestsResultsItemTemplateDashboard,
  [`${appName}.ResultsGrid.item`]: () => null,
  [`${appName}.SearchApp.layout`]: RequestsSearchLayoutWithApp,
  [`${appName}.SearchApp.results`]: RequestsResults,
  [`${appName}.SearchBar.element`]: RDMRecordSearchBarElement,
  [`${appName}.EmptyResults.element`]: RequestsEmptyResultsWithState,
  ...defaultContribComponents,
  "InvenioRequests.RequestTypeIcon.layout.community-membership-request":
    CommunityMembershipRequestIcon,
};

const overriddenComponents = overrideStore.getAll();

createSearchAppInit(
  { ...defaultComponents, ...overriddenComponents },
  true,
  "invenio-search-config",
  true
);
