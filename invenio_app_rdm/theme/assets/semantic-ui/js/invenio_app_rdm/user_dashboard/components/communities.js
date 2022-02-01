// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  SearchAppFacets,
  SearchAppResultsPane,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import {
  Accordion,
  Input,
  Card,
  Container,
  Grid,
  Label,
  Item,
  Button,
  Segment,
} from "semantic-ui-react";
import _truncate from "lodash/truncate";
import { BucketAggregation, SearchBar } from "react-searchkit";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  SearchHelpLinks,
} from "../../search/components";
import { DashboardResultView } from "./base";

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
  return (
    <Item key={index}>
      {index == 0 ? (
        <Item.Image size="tiny" src={result.links.logo} />
      ) : (
        <Item.Image size="tiny" src="/static/images/placeholder.png" />
      )}
      <Item.Content>
        <Item.Header href={`/communities/${result.id}`}>
          {result.metadata.title}
          {result.metadata.type && (
            <span style={{ marginLeft: "5px" }}>
              <Label size="small">{result.metadata.type}</Label>
            </span>
          )}
        </Item.Header>
        {result.metadata.website && (
          <Item.Content href={result.metadata.website} target="_blank">
            <a href={result.metadata.website} target="_blank">
              {result.metadata.website}
            </a>
          </Item.Content>
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

export const CommunitiesSearchLayout = (props) => (
  <Container>
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column width={4} />
        <Grid.Column width={8}>
          <SearchBar placeholder="Search communities..." />
        </Grid.Column>
        <Grid.Column width={4}>
          <Button
            color="green"
            icon="upload"
            href="/communities/new"
            content="New community"
            floated="right"
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={4}>
          <SearchAppFacets aggs={props.config.aggs} />
        </Grid.Column>
        <Grid.Column width={12}>
          <SearchAppResultsPane layoutOptions={props.config.layoutOptions} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);

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

export const defaultComponents = {
  "user-communities-search.BucketAggregation.element":
    RDMBucketAggregationElement,
  "user-communities-search.BucketAggregationValues.element":
    RDMRecordFacetsValues,
  "user-communities-search.SearchApp.facets": CommunitiesFacets,
  "user-communities-search.ResultsList.item": CommunitiesResultsItemTemplate,
  "user-communities-search.ResultsGrid.item": ResultsGridItemTemplate,
  "user-communities-search.SearchApp.layout": CommunitiesSearchLayout,
  "user-communities-search.SearchBar.element": CommunitiesSearchBarElement,
  "user-communities-search.SearchApp.results": DashboardResultView,
};
