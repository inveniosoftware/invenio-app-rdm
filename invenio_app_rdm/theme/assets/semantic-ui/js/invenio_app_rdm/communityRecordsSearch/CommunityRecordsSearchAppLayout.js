import {
  SearchAppFacets,
  SearchAppResultsPane,
  SearchBar,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import { Count, Sort } from "react-searchkit";
import { Button, Container, Grid } from "semantic-ui-react";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";

export const CommunityRecordsSearchAppLayout = ({ config, appName }) => {
  const [sidebarVisible, setSidebarVisible] = React.useState(false);

  return (
    <Container className="rel-pt-2">
      <Grid>
        <Grid.Column only="mobile tablet" mobile={2} tablet={1}>
          <Button
            basic
            icon="sliders"
            onClick={() => setSidebarVisible(true)}
            aria-label={i18next.t("Filter results")}
          />
        </Grid.Column>

        <Grid.Column mobile={14} tablet={14} computer={12} floated="right">
          <Grid>
            <Grid.Column width={16}>
              <SearchBar placeholder={i18next.t("Search records in community...")} />
            </Grid.Column>

            <Grid.Column width={4} textAlign="left">
              <Count
                label={(cmp) => (
                  <Trans key="communityRecordsSearch" count={cmp}>
                    {cmp} results found
                  </Trans>
                )}
              />
            </Grid.Column>
            <Grid.Column width={12} textAlign="right">
              <Sort
                values={config.sortOptions}
                label={(cmp) => (
                  <>
                    <label className="mr-10">{i18next.t("Sort by")}</label>
                    {cmp}
                  </>
                )}
              />
            </Grid.Column>
          </Grid>
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

CommunityRecordsSearchAppLayout.defaultProps = {
  appName: "",
};
