/*
 * // This file is part of Invenio-Requests
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-Requests is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import { SearchAppResultsPane } from "@js/invenio_search_ui/components";
import { SearchFacets } from "@js/invenio_administration";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { UserStatusFilter } from "./filters";
import { SearchBar, Sort } from "react-searchkit";
import { Grid } from "semantic-ui-react";

export class UserSearchLayout extends Component {
  render() {
    const { config, appName } = this.props;
    return (
      <>
        {/* auto column grid used instead of SUI grid for better searchbar width adjustment */}
        <div className="auto-column-grid">
          <div className="flex column-mobile">
            <div className="mobile only rel-mb-1 flex align-items-center justify-space-between">
              <UserStatusFilter keepFiltersOnUpdate />
            </div>

            <div className="tablet only computer only rel-mr-2">
              <UserStatusFilter keepFiltersOnUpdate />
            </div>
            <div className="full-width">
              <SearchBar fluid />
            </div>
          </div>
          <div className="flex align-items-center column-mobile">
            <div className="full-width flex align-items-center justify-end column-mobile">
              {/*<SearchFilters customFilters={customFilters} />*/}
              <Sort values={config.sortOptions} />
            </div>
          </div>
        </div>
        <div className="rel-mb-1">
          {/*<FilterLabels ignoreFilters={["is_open"]} />*/}
        </div>
        <Grid>
          <Grid.Column
            computer={4}
            mobile={16}
            tablet={16}
            largeScreen={2}
            widescreen={2}
          >
            <SearchFacets aggs={config.aggs} appName={appName} />
          </Grid.Column>
          <Grid.Column
            mobile={16}
            tablet={16}
            computer={12}
            largeScreen={14}
            widescreen={14}
          >
            <SearchAppResultsPane
              layoutOptions={config.layoutOptions}
              appName={appName}
            />
          </Grid.Column>
        </Grid>
      </>
    );
  }
}

UserSearchLayout.propTypes = {
  config: PropTypes.object.isRequired,
  appName: PropTypes.string,
};

UserSearchLayout.defaultProps = {
  appName: "",
};
