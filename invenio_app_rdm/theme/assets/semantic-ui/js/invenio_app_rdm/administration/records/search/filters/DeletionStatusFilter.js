/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import { i18next } from "@translations/invenio_requests/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withState } from "react-searchkit";
import { Button } from "semantic-ui-react";

class DeletionStatusFilterComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: "P",
    };
  }

  componentDidMount() {
    const { currentQueryState } = this.props;
    const userSelectionFilters = currentQueryState.filters;
    const openFilter = userSelectionFilters.find((obj) => obj.includes("status"));

    if (openFilter) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        selected: openFilter[1],
      });
    }
  }

  /**
   * Updates queryFilters based on selection and removing previous filters
   * @param {string} selectedFilter indicates which button was clicked
   * @param {string} value true if open requests and false if closed requests
   */
  filterRecords = (value = "P") => {
    const { currentQueryState, updateQueryState, keepFiltersOnUpdate } = this.props;
    const { selected } = this.state;

    if (selected === value) {
      return;
    } else {
      // remove other filters on change
      currentQueryState.filters = [];
    }
    this.setState({
      selected: value,
    });

    currentQueryState.filters = keepFiltersOnUpdate
      ? currentQueryState.filters.filter((element) => element[0] !== "status")
      : [];

    currentQueryState.filters.push(["status", value]);

    // For deleted and marked for purge filters we show by default all versions
    if (["D", "X"].includes(value)) {
      currentQueryState.filters.push(["allversions", true]);
    }
    updateQueryState(currentQueryState);
  };

  retrievePublished = () => {
    this.filterRecords("P");
  };

  retrieveDeleted = () => {
    this.filterRecords("D");
  };

  retrieveMarked = () => {
    this.filterRecords("X");
  };

  render() {
    const { selected } = this.state;
    return (
      <Button.Group basic>
        <Button
          className="record-search-filter"
          onClick={this.retrievePublished}
          active={selected === "P"}
        >
          {i18next.t("Published")}
        </Button>
        <Button
          className="record-search-filter"
          onClick={this.retrieveDeleted}
          active={selected === "D"}
        >
          {i18next.t("Deleted")}
        </Button>
        <Button
          className="record-search-filter"
          onClick={this.retrieveMarked}
          active={selected === "X"}
        >
          {i18next.t("Scheduled for purge")}
        </Button>
      </Button.Group>
    );
  }
}

DeletionStatusFilterComponent.propTypes = {
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  keepFiltersOnUpdate: PropTypes.bool,
};

DeletionStatusFilterComponent.defaultProps = {
  keepFiltersOnUpdate: false,
};

export const DeletionStatusFilter = withState(DeletionStatusFilterComponent);
