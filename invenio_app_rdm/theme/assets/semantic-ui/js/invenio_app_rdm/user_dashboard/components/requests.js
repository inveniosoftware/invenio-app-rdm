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
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React from "react";
import {
  BucketAggregation,
  Count,
  Pagination,
  ResultsList,
  ResultsPerPage,
  SearchBar,
  Sort,
} from "react-searchkit";
import {
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Item,
  Label,
  Segment,
} from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  SearchHelpLinks,
} from "../../search/components";

export const RequestsResults = ({
  sortOptions,
  paginationOptions,
  currentResultsState,
}) => {
  const { total } = currentResultsState.data;
  return (
    total && (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Grid>
                <Grid.Row
                  verticalAlign="middle"
                  className="small padding-tb-5 deposit-result-header"
                >
                  <Grid.Column width={4}>
                    <Count
                      label={() => (
                        <>
                          {total} {i18next.t("result(s) found")}
                        </>
                      )}
                    />
                  </Grid.Column>
                  <Grid.Column
                    width={12}
                    textAlign="right"
                    className="padding-r-5"
                  >
                    {sortOptions && (
                      <Sort
                        values={sortOptions}
                        label={(cmp) => (
                          <>
                            {i18next.t("Sort by")} {cmp}
                          </>
                        )}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <ResultsList />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign="middle">
          <Grid.Column width={4}></Grid.Column>
          <Grid.Column width={8} textAlign="center">
            <Pagination
              options={{
                size: "mini",
                showFirst: false,
                showLast: false,
              }}
            />
          </Grid.Column>
          <Grid.Column textAlign="right" width={4}>
            <ResultsPerPage
              values={paginationOptions.resultsPerPage}
              label={(cmp) => (
                <>
                  {" "}
                  {cmp} {i18next.t("results per page")}
                </>
              )}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  );
};

export function RequestsResultsGridItemTemplate({ result, index }) {
  return (
    <Card fluid key={index} href={`/requests/${result.metadata.id}`}>
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

export function RequestsResultsItemTemplate({ result, index }) {
  return (
    <Item key={index}>
      <Item.Content>
        <Item.Header href={`/requests/${result.id}`}>
          {result.metadata.title}
          {result.metadata.type && (
            <span style={{ marginLeft: "5px" }}>
              <Label size="small">{result.metadata.type}</Label>
            </span>
          )}
        </Item.Header>
        <Item.Meta>
          <div
            dangerouslySetInnerHTML={{ __html: result.metadata.description }}
          />
        </Item.Meta>
      </Item.Content>
    </Item>
  );
}
// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description_stripped = _get(
    result,
    "ui.description_stripped",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/requests/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(description_stripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export const RDMEmptyResults = (props) => {
  const queryString = props.queryString;
  return queryString === "" ? (
    <Segment.Group>
      <Segment placeholder textAlign="center" padded="very">
        <Header as="h1" align="center">
          <Header.Content>
            {i18next.t("Get started!")}
            <Header.Subheader>
              {i18next.t("Create your first request!")}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider hidden />
        <Button
          color="green"
          icon="upload"
          floated="right"
          href="/requests/new"
          content={i18next.t("New request")}
        />
      </Segment>
    </Segment.Group>
  ) : (
    <Segment placeholder textAlign="center">
      <Header icon>
        <Icon name="search" />
        {i18next.t("No results found!")}
      </Header>
      {queryString && (
        <em>
          {i18next.t("Current search")} "{queryString}"
        </em>
      )}
      <br />
      <Button primary onClick={() => props.resetQuery()}>
        {i18next.t("Clear query")}
      </Button>
    </Segment>
  );
};

export const RDMRequestsSearchLayout = (props) => (
  <Container>
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column width={4} />
        <Grid.Column width={8}>
          <SearchBar placeholder={i18next.t("Search requests...")} />
        </Grid.Column>
        <Grid.Column width={4}>
          <Button
            color="green"
            icon="upload"
            href="/requests/new"
            content={i18next.t("New request")}
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

export const RequestsFacets = ({ aggs, currentResultsState }) => {
  return (
    <aside aria-label={i18next.t("filters")} id="search-filters">
      {aggs.map((agg) => {
        return (
          <div className="ui accordion" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}
      <SearchHelpLinks />
    </aside>
  );
};

export const defaultComponents = {
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "SearchApp.facets": RequestsFacets,
  "ResultsList.item": RequestsResultsItemTemplate,
  "ResultsGrid.item": RequestsResultsGridItemTemplate,
  "SearchApp.layout": RDMRequestsSearchLayout,
  "SearchApp.results": RequestsResults,
  "SearchBar.element": RDMRecordSearchBarElement,
};
