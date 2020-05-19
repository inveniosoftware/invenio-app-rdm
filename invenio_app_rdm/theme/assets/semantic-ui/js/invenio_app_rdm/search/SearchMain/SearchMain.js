// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";

import { Container, Grid } from "semantic-ui-react";
import { ReactSearchKit, InvenioSearchApi } from "react-searchkit";
import { SearchResults } from "./SearchResults";
import { SearchFacets } from "./SearchFacets";
import { config } from "../config";

const searchApi = new InvenioSearchApi(config.searchApi);

export class SearchMain extends Component {
  render() {
    return (
      <ReactSearchKit searchApi={searchApi} eventListenerEnabled={true}>
        <Container>
          <Grid relaxed style={{ padding: "2em 0" }}>
            <Grid.Row columns={2}>
              <Grid.Column width={4} className="search-aggregations">
                <SearchFacets />
              </Grid.Column>
              <Grid.Column width={12}>
                <SearchResults />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </ReactSearchKit>
    );
  }
}
