// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { Component } from "react";
import {
  Count,
  Pagination,
  ResultsList,
  ResultsPerPage,
  Sort,
} from "react-searchkit";
import { Grid, Segment } from "semantic-ui-react";

import Overridable from "react-overridable";

export function DashboardResultView({
  sortOptions,
  paginationOptions,
  currentResultsState,
}) {
  const { total } = currentResultsState;
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={16}>
          <Segment>
            <Grid>
              <Overridable
                id="DashboardResultView.resultHeader"
                {...this.props}
              >
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
              </Overridable>
              <Overridable id="DashboardResultView.resultList" {...this.props}>
                <Grid.Row>
                  <Grid.Column>
                    <ResultsList />
                  </Grid.Column>
                </Grid.Row>
              </Overridable>
            </Grid>
          </Segment>
        </Grid.Column>
      </Grid.Row>
      <Overridable id="DashboardResultView.resultFooter" {...this.props}>
        <Grid.Row verticalAlign="middle">
          <Grid.Column width={4}></Grid.Column>
          <Grid.Column width={8} textAlign="center" floated="right">
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
      </Overridable>
    </Grid>
  );
}
