/*
 * // This file is part of Invenio-Requests
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-Requests is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { RequestStatusFilter } from "@js/invenio_requests/search";
import { SearchBar, Sort } from "react-searchkit";

export class RequestsSearchbarLayout extends Component {
  render() {
    const { config } = this.props;

    return (
      <>
        {/* auto column grid used instead of SUI grid for better searchbar width adjustment */}
        <div className="auto-column-grid">
          <div className="flex column-mobile">
            <div className="mobile only rel-mb-1 flex align-items-center justify-space-between">
              <RequestStatusFilter keepFiltersOnUpdate />
            </div>

            <div className="tablet only computer only rel-mr-2">
              <RequestStatusFilter keepFiltersOnUpdate />
            </div>
            <div className="full-width">
              <SearchBar fluid />
            </div>
          </div>
          <div className="flex align-items-center column-mobile">
            <div className="full-width flex align-items-center justify-end column-mobile">
              <Sort values={config.sortOptions} />
            </div>
          </div>
        </div>
        <div className="rel-mb-1" />
      </>
    );
  }
}

RequestsSearchbarLayout.propTypes = {
  config: PropTypes.object.isRequired,
};
