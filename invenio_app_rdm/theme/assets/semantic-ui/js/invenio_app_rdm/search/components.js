// This file is part of InvenioRDM
// Copyright (C) 2020-2024 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021-2022 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  SearchBar,
  MultipleOptionsSearchBarRSK,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React from "react";
import Overridable from "react-overridable";
import { withState, buildUID } from "react-searchkit";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Header,
  Icon,
  Input,
  Label,
  Message,
  Segment,
} from "semantic-ui-react";
import RecordsResultsListItem from "../components/RecordsResultsListItem";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";

export const RDMRecordResultsListItemWithState = withState(
  ({ currentQueryState, result, appName }) => (
    <RecordsResultsListItem
      currentQueryState={currentQueryState}
      result={result}
      appName={appName}
    />
  )
);

RDMRecordResultsListItemWithState.propTypes = {
  currentQueryState: PropTypes.object,
  result: PropTypes.object.isRequired,
};

RDMRecordResultsListItemWithState.defaultProps = {
  currentQueryState: null,
};

// TODO: Update this according to the full List item template?
export const RDMRecordResultsGridItem = ({ result }) => {
  const descriptionStripped = _get(result, "ui.description_stripped", "No description");
  return (
    <Card fluid href={`/records/${result.pid}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(descriptionStripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

RDMRecordResultsGridItem.propTypes = {
  result: PropTypes.object.isRequired,
};

export const RDMRecordSearchBarContainer = ({ appName }) => {
  return (
    <Overridable id={buildUID("SearchApp.searchbar", "", appName)}>
      <SearchBar />
    </Overridable>
  );
};

RDMRecordSearchBarContainer.propTypes = {
  appName: PropTypes.string.isRequired,
};

export const RDMRecordMultipleSearchBarElement = ({ queryString, onInputChange }) => {
  const headerSearchbar = document.getElementById("header-search-bar");
  const searchbarOptions = JSON.parse(headerSearchbar.dataset.options);

  return (
    <MultipleOptionsSearchBarRSK
      options={searchbarOptions}
      onInputChange={onInputChange}
      queryString={queryString}
      placeholder={i18next.t("Search records...")}
    />
  );
};

RDMRecordMultipleSearchBarElement.propTypes = {
  queryString: PropTypes.string.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export const RDMRecordSearchBarElement = withState(
  ({
    placeholder: passedPlaceholder,
    queryString,
    onInputChange,
    updateQueryState,
    currentQueryState,
  }) => {
    const placeholder = passedPlaceholder || i18next.t("Search");

    const onSearch = () => {
      updateQueryState({ ...currentQueryState, queryString });
    };

    const onBtnSearchClick = () => {
      onSearch();
    };
    const onKeyPress = (event) => {
      if (event.key === "Enter") {
        onSearch();
      }
    };
    return (
      <Input
        action={{
          "icon": "search",
          "onClick": onBtnSearchClick,
          "className": "search",
          "aria-label": i18next.t("Search"),
        }}
        fluid
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event, { value }) => {
          onInputChange(value);
        }}
        value={queryString}
        onKeyPress={onKeyPress}
      />
    );
  }
);

export const RDMToggleComponent = ({
  updateQueryFilters,
  userSelectionFilters,
  filterValue,
  label,
  title,
}) => {
  const _isChecked = (userSelectionFilters) => {
    const isFilterActive =
      userSelectionFilters.filter((filter) => filter[0] === filterValue[0]).length > 0;
    return isFilterActive;
  };

  const onToggleClicked = () => {
    updateQueryFilters(filterValue);
  };

  var isChecked = _isChecked(userSelectionFilters);
  return (
    <Card className="borderless facet">
      <Card.Content>
        <Card.Header as="h2">{title}</Card.Header>
      </Card.Content>
      <Card.Content>
        <Checkbox
          toggle
          label={<label aria-hidden="true">{label}</label>}
          name="versions-toggle"
          aria-label={label}
          onClick={onToggleClicked}
          checked={isChecked}
        />
      </Card.Content>
    </Card>
  );
};

RDMToggleComponent.propTypes = {
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  filterValue: PropTypes.array.isRequired,
  userSelectionFilters: PropTypes.array.isRequired,
  updateQueryFilters: PropTypes.func.isRequired,
};

export const RDMCountComponent = ({ totalResults }) => {
  return <Label>{totalResults.toLocaleString(i18next.language)}</Label>;
};

RDMCountComponent.propTypes = {
  totalResults: PropTypes.number.isRequired,
};

export const RDMEmptyResults = ({ queryString, searchPath, resetQuery }) => {
  return (
    <Grid>
      <Grid.Row centered>
        <Grid.Column width={12} textAlign="center">
          <Header as="h2">
            {i18next.t("We couldn't find any matches for {{- search}}", {
              search: (queryString && `'${queryString}'`) || "your search",
            })}
          </Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={8} textAlign="center">
          <Button primary onClick={resetQuery}>
            <Icon name="search" />
            {i18next.t("Start over")}
          </Button>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row centered>
        <Grid.Column width={12}>
          <Segment secondary padded size="large">
            <Header as="h3" size="small">
              {i18next.t("ProTip")}!
            </Header>
            <Trans>
              <p>
                <a href={`${searchPath}?q=metadata.publication_date:[2017-01-01 TO *]`}>
                  metadata.publication_date:[2017-01-01 TO *]
                </a>{" "}
                will give you all the publications from 2017 until today.
              </p>
            </Trans>
            <Trans>
              <p>
                For more tips, check out our{" "}
                <a href="/help/search" title={i18next.t("Search guide")}>
                  search guide
                </a>{" "}
                for defining advanced search queries.
              </p>
            </Trans>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

RDMEmptyResults.propTypes = {
  queryString: PropTypes.string.isRequired,
  resetQuery: PropTypes.func.isRequired,
  searchPath: PropTypes.string,
};

RDMEmptyResults.defaultProps = {
  searchPath: "/search",
};

export const RDMErrorComponent = ({ error }) => {
  return <Message error content={error.response.data.message} icon="warning sign" />;
};

RDMErrorComponent.propTypes = {
  error: PropTypes.object.isRequired,
};
