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
import React, { Component } from "react";
import {
  Count,
  Pagination,
  ResultsList,
  ResultsPerPage,
  SearchBar,
  Sort,
} from "react-searchkit";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import { Grid, Segment, Button } from "semantic-ui-react";

import Overridable from "react-overridable";

export function DashboardResultView(props) {
  const { sortOptions, paginationOptions, currentResultsState } = props;
  const { total } = currentResultsState.data;
  return (
    total && (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Grid>
                <Overridable id="DashboardResultView.resultHeader" {...props}>
                  <Grid.Row
                    verticalAlign="middle"
                    className="small pt-5 pb-5 highlight-background"
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
                <Overridable id="DashboardResultView.resultList" {...props}>
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
        <Overridable id="DashboardResultView.resultFooter" {...props}>
          <Grid.Row verticalAlign="middle">
            <Grid.Column width={4} />
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
    )
  );
}

export const DashboardSearchLayoutHOC = ({
  searchBarPlaceholder = "",
  newBtn = () => null,
  ...props
}) => {
  const DashboardUploadsSearchLayout = (props) => {
    const [sidebarVisible, setSidebarVisible] = React.useState(false);

    return (
      <Grid>
        <Grid.Column only="mobile tablet" mobile={2} tablet={1}>
          <Button
            basic
            icon="sliders"
            onClick={() => setSidebarVisible(true)}
            aria-label={i18next.t("Filter results")}
          />
        </Grid.Column>

        <Grid.Column mobile={14} tablet={11} computer={8} floated="right">
          <SearchBar placeholder={searchBarPlaceholder} />
        </Grid.Column>

        <Grid.Column mobile={16} tablet={4} computer={4} align="right">
          {newBtn}
        </Grid.Column>

        <Grid.Row>
          <GridResponsiveSidebarColumn
            width={4}
            open={sidebarVisible}
            onHideClick={() => setSidebarVisible(false)}
            children={<SearchAppFacets aggs={props.config.aggs} />}
          />
          <Grid.Column mobile={16} tablet={16} computer={12}>
            <SearchAppResultsPane layoutOptions={props.config.layoutOptions} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  };
  return DashboardUploadsSearchLayout;
};
