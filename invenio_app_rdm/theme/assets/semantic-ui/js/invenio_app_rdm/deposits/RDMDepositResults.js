/*
 * This file is part of Invenio.
 * Copyright (C) 2020 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  LayoutSwitcher,
  Pagination,
  ResultsMultiLayout,
  Sort,
} from "react-searchkit";
import { Button, Input, Checkbox, Grid, Segment } from "semantic-ui-react";

export class Results extends Component {
  render() {
    const { sortValues, currentResultsState } = this.props;
    const { total } = currentResultsState.data;
    return (
      total && (
        <>
          <Input icon="search" placeholder="Search uploads..." />
          <Button
            color="green"
            icon="upload"
            floated="right"
            href="/deposits/new"
            content="New upload"
          />
          <Segment>
            <Grid>
              <Grid.Row verticalAlign="middle" className="header-row">
                <Grid.Column width={7}>
                  <Checkbox label="Select all" />
                </Grid.Column>
                <Grid.Column width={5} textAlign="right">
                  <LayoutSwitcher defaultLayout="list" />
                </Grid.Column>
                <Grid.Column width={4} textAlign="right">
                  {sortValues && (
                    <Sort
                      values={sortValues}
                      label={(cmp) => <>Sort by {cmp}</>}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <ResultsMultiLayout />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row verticalAlign="middle" textAlign="center">
                <Grid.Column>
                  <Pagination />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </>
      )
    );
  }
}

Results.propTypes = {
  sortValues: PropTypes.array,
};

Results.defaultProps = {
  sortValues: [],
};
