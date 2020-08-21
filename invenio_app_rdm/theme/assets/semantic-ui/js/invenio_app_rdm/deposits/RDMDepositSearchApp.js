/*
 * This file is part of Invenio.
 * Copyright (C) 2020 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { OverridableContext, overrideStore } from "react-overridable";
import {
  BucketAggregation,
  EmptyResults,
  Error,
  InvenioSearchApi,
  ReactSearchKit,
  ResultsLoader,
  withState,
} from "react-searchkit";
import { Container, Grid } from "semantic-ui-react";
import { Results } from "./RDMDepositResults";
import SearchBar from "@js/invenio_search_ui/SearchBar";

const OnResults = withState(Results);

export class SearchApp extends Component {
  render() {
    const { appName, config } = this.props;
    const searchApi = new InvenioSearchApi({
      axios: {
        url: config.api,
        withCredentials: true,
      },
      headers: { Accept: config.mimetype },
    });

    return (
      <OverridableContext.Provider value={overrideStore.getAll()}>
        <ReactSearchKit searchApi={searchApi} appName={appName}>
          <Container>
            <Grid relaxed padded>
              <Grid.Row>
                <Grid.Column width={4} />
                <Grid.Column width={12}>
                  <SearchBar />
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Grid relaxed padded>
              <Grid.Row columns={2}>
                <Grid.Column width={4}>
                  {config.aggs.map((agg) => (
                    <BucketAggregation
                      key={agg.title}
                      title={agg.title}
                      agg={{
                        field: agg.field,
                        aggName: agg.aggName,
                      }}
                    />
                  ))}
                </Grid.Column>
                <Grid.Column width={12}>
                  <ResultsLoader>
                    <EmptyResults />
                    <Error />
                    <OnResults sortValues={config.sort_options} />
                  </ResultsLoader>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Container>
        </ReactSearchKit>
      </OverridableContext.Provider>
    );
  }
}

SearchApp.propTypes = {
  config: PropTypes.shape({
    api: PropTypes.string,
    mimetype: PropTypes.string,
    aggs: PropTypes.array,
    sort_options: PropTypes.array,
  }).isRequired,
  appName: PropTypes.string,
};

SearchApp.defaultProps = {
  config: {
    api: "",
    mimetype: "",
    aggs: [],
    sort_options: [],
  },
  appName: null,
};
