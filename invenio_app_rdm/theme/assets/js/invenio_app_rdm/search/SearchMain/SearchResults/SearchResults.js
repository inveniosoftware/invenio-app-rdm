// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Container, Grid } from "semantic-ui-react";
import _truncate from "lodash/truncate";
import {
  Count,
  LayoutSwitcher,
  Pagination,
  ResultsMultiLayout,
  ResultsPerPage,
  Sort,
  EmptyResults,
  Error,
  ResultsLoader,
  withState
} from "react-searchkit";

import { ResultsGridItem, ResultsListItem } from "./components";
import { config } from "../../config";

const SpanWithMargin = ({ text, margin }) => {
  const size = "0.3em";
  let style;
  switch (margin) {
    case "left":
      style = { marginLeft: size };
      break;
    case "right":
      style = { marginRight: size };
      break;
    default:
      style = { margin: `0 ${size}` };
  }
  return <span style={style}>{text}</span>;
};

class Results extends Component {
  render() {
    const { total } = this.props.currentResultsState.data;
    return total ? (
      <Container>
        <Grid relaxed verticalAlign="middle">
          <Grid.Column width={8}>
            <SpanWithMargin text="Found" margin="right" />
            <Count />
            <SpanWithMargin text="results sorted by" />
            <Sort values={config.sortValues} />
          </Grid.Column>
          <Grid.Column width={8} textAlign="right">
            <SpanWithMargin text="Show" margin="right" />
            <ResultsPerPage
              values={config.resultsPerPageValues}
              defaultValue={10}
            />
            <SpanWithMargin text="results per page" />
            <LayoutSwitcher defaultLayout="list" />
          </Grid.Column>
        </Grid>
        <Grid relaxed style={{ padding: "2em 0" }} with={16}>
          <ResultsLoader>
            <ResultsMultiLayout
              resultsListCmp={ResultsListItem}
              resultsGridCmp={ResultsGridItem}
            />
          </ResultsLoader>
        </Grid>
        <Grid relaxed verticalAlign="middle" textAlign="center">
          <Pagination />
        </Grid>
      </Container>
    ) : null;
  }
}

const OnResults = withState(Results);

export const SearchResults = () => (
  <ResultsLoader>
    <EmptyResults />
    <Error />
    <OnResults
      sortValues={config.sortValues}
      resultsPerPageValues={config.resultsPerPageValues}
    />
  </ResultsLoader>
);
