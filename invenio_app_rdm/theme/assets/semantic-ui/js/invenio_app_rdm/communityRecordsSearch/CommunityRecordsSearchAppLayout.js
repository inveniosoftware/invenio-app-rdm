/*
 * SPDX-FileCopyrightText: 2023-2024 CERN.
 * SPDX-FileCopyrightText: 2025 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import {
  SearchAppFacets,
  SearchAppResultsPane,
  SearchBar,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { useState } from "react";
import { Count, Sort } from "react-searchkit";
import { Button, Container, Grid } from "semantic-ui-react";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import PropTypes from "prop-types";

export const CommunityRecordsSearchAppLayout = ({ config, appName = "" }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <Container className="rel-pt-2">
      <SearchBar placeholder={i18next.t("Search records in community...")} />
      <Grid>
        <Grid.Column only="mobile tablet" mobile={2} tablet={1} verticalAlign="middle">
          <Button
            basic
            icon="sliders"
            onClick={() => setSidebarVisible(true)}
            aria-label={i18next.t("Filter results")}
          />
        </Grid.Column>

        <Grid.Column
          mobile={14}
          tablet={15}
          computer={12}
          floated="right"
          verticalAlign="middle"
        >
          {/* Flex layout keeps count on one line and aligns sort controls */}
          <div className="flex align-items-center justify-space-between">
            <div className="community-records-search-count">
              <Count
                label={(cmp) => (
                  <>
                    {cmp} {i18next.t("results found")}
                  </>
                )}
              />
            </div>
            <div className="community-records-search-sort">
              <Sort
                values={config.sortOptions}
                label={(cmp) => (
                  <>
                    <label className="mr-10">{i18next.t("Sort by")}</label>
                    {cmp}
                  </>
                )}
              />
            </div>
          </div>
        </Grid.Column>

        <Grid.Row>
          <GridResponsiveSidebarColumn
            width={4}
            open={sidebarVisible}
            onHideClick={() => setSidebarVisible(false)}
            // eslint-disable-next-line react/no-children-prop
            children={<SearchAppFacets aggs={config.aggs} appName={appName} />}
          />
          <Grid.Column mobile={16} tablet={16} computer={12}>
            <SearchAppResultsPane
              layoutOptions={config.layoutOptions}
              appName={appName}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

CommunityRecordsSearchAppLayout.propTypes = {
  config: PropTypes.object.isRequired,
  appName: PropTypes.string,
};
