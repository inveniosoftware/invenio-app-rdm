// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import {
  Accordion,
  Input,
  Card,
  Label,
  Item,
  Button,
  Icon,
  Segment,
  Header,
} from "semantic-ui-react";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import { BucketAggregation, SearchBar } from "react-searchkit";
import {
  RDMRecordSearchBarElement,
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  SearchHelpLinks,
} from "../../search/components";
import { Image } from "../../components/Image"; // common components
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";

function ResultsGridItemTemplate({ result, index }) {
  return (
    <Card fluid key={index} href={`/communities/${result.metadata.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          <div
            dangerouslySetInnerHTML={{ __html: result.metadata.description }}
          />
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

export function CommunitiesResultsItemTemplate({ result, index }) {
  const community_type = _get(
    result,
    "metadata.type",
    i18next.t("No community type")
  );
  return (
    <Item key={index}>
      <Image
        src={result.links.logo}
        fallbackSrc="/static/images/square-placeholder.png"
        className="ui tiny image"
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
          >
            <Icon name="edit" />
            {i18next.t("Edit")}
          </Button>
          <Button
            compact
            size="small"
            floated="right"
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
            dangerouslySetInnerHTML={{ __html: result.metadata.description }}
          />
        </Item.Meta>
      </Item.Content>
    </Item>
  );
}

export const CommunitiesSearchBarElement = ({
  placeholder: passedPlaceholder,
  queryString,
  onInputChange,
  executeSearch,
}) => {
  const placeholder = passedPlaceholder || "Search";
  const onBtnSearchClick = () => {
    executeSearch();
  };
  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };
  return (
    <Input
      action={{
        icon: "search",
        onClick: onBtnSearchClick,
        className: "search",
      }}
      fluid
      placeholder={placeholder}
      onChange={(event, { value }) => {
        onInputChange(value);
      }}
      value={queryString}
      onKeyPress={onKeyPress}
    />
  );
};

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
          <Accordion key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </Accordion>
        );
      })}
      <SearchHelpLinks />
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
  "user-communities-search.BucketAggregation.element":
    RDMBucketAggregationElement,
  "user-communities-search.BucketAggregationValues.element":
    RDMRecordFacetsValues,
  "user-communities-search.EmptyResults.element": RDMCommunitiesEmptyResults,
  "user-communities-search.ResultsList.item": CommunitiesResultsItemTemplate,
  "user-communities-search.ResultsGrid.item": ResultsGridItemTemplate,
  "user-communities-search.SearchApp.facets": CommunitiesFacets,
  "user-communities-search.SearchApp.layout": DashboardCommunitiesSearchLayout,
  "user-communities-search.SearchApp.results": DashboardResultView,
  "user-communities-search.SearchBar.element": RDMRecordSearchBarElement,
};
