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
import _get from "lodash/get";
import React from "react";
import { Image } from "react-invenio-forms";
import { BucketAggregation } from "react-searchkit";
import {
  Button,
  Card,
  Header,
  Icon,
  Input,
  Item,
  Label,
  Segment,
} from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  SearchHelpLinks,
} from "../search/components";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";

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

export function CommunitiesResultsItemTemplate({ result, index }) {
  const community_type = _get(
    result,
    "metadata.type.title.en",
    i18next.t("No community type")
  );
  return (
    <Item key={index}>
      <Image
        wrapped
        src={result.links.logo}
        fallbackSrc="/static/images/square-placeholder.png"
        size="tiny"
      />
      <Item.Content>
        <Item.Extra className="user-communities labels-actions">
          {/* For reduced spacing between labels. */}
          <span>
            <Label size="tiny" color="grey">
              {community_type}
            </Label>
          </span>
          <Button
            compact
            size="small"
            floated="right"
            href={`/communities/${result.id}/settings`}
            className="mt-0"
          >
            <Icon name="edit" />
            {i18next.t("Edit")}
          </Button>
          <Button
            compact
            size="small"
            floated="right"
            className="mt-0"
            href={`/communities/${result.id}`}
          >
            <Icon name="eye" />
            {i18next.t("View")}
          </Button>
        </Item.Extra>
        <Item.Header href={`/communities/${result.id}`}>
          {result.metadata.title}
        </Item.Header>
        {result.metadata.website && (
          <a href={result.metadata.website} target="_blank">
            {result.metadata.website}
          </a>
        )}
        <Item.Meta>
          <div
            className="truncate-lines-2"
            dangerouslySetInnerHTML={{
              __html: result.metadata.description,
            }}
          />
        </Item.Meta>
      </Item.Content>
    </Item>
  );
}

export const DashboardCommunitiesSearchLayout = DashboardSearchLayoutHOC({
  searchBarPlaceholder: i18next.t("Search communities..."),
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

export const CommunitiesFacets = ({ aggs, currentResultsState }) => {
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

export const RDMCommunitiesEmptyResults = (props) => {
  const queryString = props.queryString;
  return (
    <>
      <Segment placeholder textAlign="center">
        <Header icon>
          <Icon name="search" />
          {i18next.t("No communities found!")}
        </Header>
        {queryString && (
          <Button primary onClick={() => props.resetQuery()}>
            {i18next.t("Reset search")}
          </Button>
        )}
      </Segment>
    </>
  );
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
