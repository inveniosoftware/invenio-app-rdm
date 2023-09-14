// This file is part of Invenio
// Copyright (C) 2023 CERN.
//
// Invenio is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_requests/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withState } from "react-searchkit";
import { Button } from "semantic-ui-react";

class UserStatusFilterComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: "active",
    };
  }

  componentDidMount() {
    const { currentQueryState } = this.props;
    const userSelectionFilters = currentQueryState.filters;
    const openFilter = userSelectionFilters.find((obj) => obj.includes("active"));
    if (openFilter) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        selected: "active",
      });
    }
  }

  /**
   * Updates queryFilters based on selection and removing previous filters
   * @param {string} selectedFilter indicates which button was clicked
   * @param {string} filterField indicates which OS query filter should be updated
   * @param {number} value true if open requests and false if closed requests
   */
  retrieveUsers = (selectedFilter, filterField, value = 1) => {
    const { currentQueryState, updateQueryState, keepFiltersOnUpdate } = this.props;
    const { selected } = this.state;

    if (selected === selectedFilter) {
      return;
    } else {
      // remove other filters on change
      currentQueryState.filters = [];
    }
    this.setState({
      selected: selectedFilter,
    });

    currentQueryState.filters = keepFiltersOnUpdate
      ? currentQueryState.filters.filter((element) => element[0] !== filterField)
      : [];

    currentQueryState.filters.push([filterField, value]);
    updateQueryState(currentQueryState);
  };

  retrieveActive = () => {
    this.retrieveUsers("active", "is_active", 1);
  };

  retrieveInactive = () => {
    this.retrieveUsers("inactive", "is_active", 0);
  };

  retrieveBlocked = () => {
    this.retrieveUsers("blocked", "is_blocked");
  };

  render() {
    const { selected } = this.state;
    return (
      <Button.Group basic>
        <Button
          className="user-search-filter"
          onClick={this.retrieveActive}
          active={selected === "active"}
        >
          {i18next.t("Active")}
        </Button>
        <Button
          className="user-search-filter"
          onClick={this.retrieveInactive}
          active={selected === "inactive"}
        >
          {i18next.t("Inactive")}
        </Button>
        <Button
          className="user-search-filter"
          onClick={this.retrieveBlocked}
          active={selected === "blocked"}
        >
          {i18next.t("Blocked")}
        </Button>
      </Button.Group>
    );
  }
}

UserStatusFilterComponent.propTypes = {
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  keepFiltersOnUpdate: PropTypes.bool,
};

UserStatusFilterComponent.defaultProps = {
  keepFiltersOnUpdate: false,
};

export const UserStatusFilter = withState(UserStatusFilterComponent);
