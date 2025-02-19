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
  InvenioSearchPagination,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import { ResultsList, SearchBar, Sort, buildUID } from "react-searchkit";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import { Grid, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import Overridable from "react-overridable";

export function DashboardResultView(props) {
  const { sortOptions, paginationOptions, currentResultsState, appName } = props;
  const { total } = currentResultsState.data;

  const handleResultsRendered = () => {
    window.invenio?.onSearchResultsRendered();
  };
  return (
    total && (
      <Grid>
        <Overridable
          id={buildUID("ResultView.resultList", "", appName)}
          sortOptions={sortOptions}
          paginationOptions={paginationOptions}
          currentResultsState={currentResultsState}
          appName={appName}
        >
          <Grid.Row>
            <Grid.Column>
              <ResultsList onResultsRendered={handleResultsRendered} />
            </Grid.Column>
          </Grid.Row>
        </Overridable>

        <Overridable
          id={buildUID("ResultView.resultFooter", "", appName)}
          sortOptions={sortOptions}
          paginationOptions={paginationOptions}
          currentResultsState={currentResultsState}
          appName={appName}
        >
          <InvenioSearchPagination
            total={total}
            paginationOptions={paginationOptions}
          />
        </Overridable>
      </Grid>
    )
  );
}

DashboardResultView.propTypes = {
  sortOptions: PropTypes.array.isRequired,
  paginationOptions: PropTypes.object.isRequired,
  currentResultsState: PropTypes.object.isRequired,
  appName: PropTypes.string,
};

DashboardResultView.defaultProps = {
  appName: "",
};

export const DashboardSearchLayoutHOC = ({
  searchBarPlaceholder = "",
  appName = undefined,
}) => {
  const DashboardUploadsSearchLayout = (props) => {
    const [sidebarVisible, setSidebarVisible] = React.useState(false);
    const { config } = props;

    return (
      <Grid>
        <Overridable
          id={buildUID("SearchLayout.searchHeader", "", appName)}
          sortOptions={config.sortOptions}
          appName={appName}
        >
          <>
            {/* Mobile/tablet search header */}
            <Grid.Row className="mobile tablet only">
              <Grid.Column mobile={2} tablet={1} verticalAlign="middle">
                <Button
                  basic
                  icon="sliders"
                  onClick={() => setSidebarVisible(true)}
                  aria-label={i18next.t("Filter results")}
                />
              </Grid.Column>
              <Grid.Column
                mobile={14}
                tablet={10}
                verticalAlign="middle"
                floated="right"
              >
                <SearchBar placeholder={searchBarPlaceholder} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row className="mobile tablet only">
              <Grid.Column width={16} textAlign="right">
                {config.sortOptions && (
                  <Sort
                    values={config.sortOptions}
                    label={(cmp) => (
                      <>
                        <label className="mr-10">{i18next.t("Sort by")}</label>
                        {cmp}
                      </>
                    )}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
            {/* End mobile/tablet search header */}

            {/* Desktop search header */}
            <Grid.Row className="computer only">
              <Grid.Column width={8} floated="right">
                <SearchBar placeholder={searchBarPlaceholder} />
              </Grid.Column>

              <Grid.Column width={4} textAlign="right">
                {config.sortOptions && (
                  <Sort
                    values={config.sortOptions}
                    label={(cmp) => (
                      <>
                        <label className="mr-10">{i18next.t("Sort by")}</label>
                        {cmp}
                      </>
                    )}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
            {/* End desktop search header */}
          </>
        </Overridable>

        <Grid.Row>
          <GridResponsiveSidebarColumn
            width={4}
            open={sidebarVisible}
            onHideClick={() => setSidebarVisible(false)}
          >
            <SearchAppFacets aggs={config.aggs} appName={appName} />
          </GridResponsiveSidebarColumn>
          <Grid.Column mobile={16} tablet={16} computer={12}>
            <SearchAppResultsPane
              layoutOptions={config.layoutOptions}
              appName={appName}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  };

  DashboardUploadsSearchLayout.propTypes = {
    config: PropTypes.object.isRequired,
  };

  return DashboardUploadsSearchLayout;
};
