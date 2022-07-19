// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createSearchAppInit } from "@js/invenio_search_ui";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import { BucketAggregation } from "react-searchkit";
import { Button, Card, Header, Icon, Segment } from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  SearchHelpLinks,
} from "../search/components";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";
import { ComputerTabletCommunitiesItem } from "./communities_items/ComputerTabletCommunitiesItem";
import { MobileCommunitiesItem } from "./communities_items/MobileCommunitiesItem";
import PropTypes from "prop-types";

function ResultsGridItemTemplate({ result, index }) {
  return (
    <Card fluid key={index} href={`/communities/${result.metadata.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          <div
            className="truncate-lines-2"
            dangerouslySetInnerHTML={{
              __html: result.metadata.description,
            }}
          />
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

ResultsGridItemTemplate.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
};

export function CommunitiesResultsItemTemplate({ result, index }) {
  return (
    <>
      <ComputerTabletCommunitiesItem result={result} index={index} />
      <MobileCommunitiesItem result={result} index={index} />
    </>
  );
}

CommunitiesResultsItemTemplate.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string,
};

CommunitiesResultsItemTemplate.defaultProps = {
  index: null,
};

export const DashboardCommunitiesSearchLayout = DashboardSearchLayoutHOC({
  searchBarPlaceholder: i18next.t("Search in my communities..."),
  newBtn: (
    <Button
      positive
      icon="upload"
      href="/communities/new"
      content={i18next.t("New community")}
      floated="right"
    />
  ),
});

export const CommunitiesFacets = ({ aggs }) => {
  return (
    <aside aria-label={i18next.t("filters")} id="search-filters">
      {aggs.map((agg) => {
        return (
          <div className="rdm-facet-container" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}

      <Card className="borderless facet mt-0">
        <Card.Content>
          <Card.Header as="h2">{i18next.t("Help")}</Card.Header>
          <SearchHelpLinks />
        </Card.Content>
      </Card>
    </aside>
  );
};

CommunitiesFacets.propTypes = {
  aggs: PropTypes.array.isRequired,
};

export const RDMCommunitiesEmptyResults = (props) => {
  const { queryString, resetQuery } = props;
  return (
    <Segment placeholder textAlign="center">
      <Header icon>
        <Icon name="search" />
        {i18next.t("No communities found!")}
      </Header>
      {queryString && (
        <Button primary onClick={() => resetQuery()}>
          {i18next.t("Reset search")}
        </Button>
      )}
    </Segment>
  );
};

RDMCommunitiesEmptyResults.propTypes = {
  queryString: PropTypes.string.isRequired,
  resetQuery: PropTypes.func.isRequired,
};

export const defaultComponents = {
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "EmptyResults.element": RDMCommunitiesEmptyResults,
  "ResultsList.item": CommunitiesResultsItemTemplate,
  "ResultsGrid.item": ResultsGridItemTemplate,
  "SearchApp.facets": CommunitiesFacets,
  "SearchApp.layout": DashboardCommunitiesSearchLayout,
  "SearchApp.results": DashboardResultView,
  "SearchBar.element": RDMRecordSearchBarElement,
};

createSearchAppInit(defaultComponents);
