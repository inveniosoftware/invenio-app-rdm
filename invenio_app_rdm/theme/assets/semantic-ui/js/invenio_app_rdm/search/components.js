// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021-2022 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Icon,
  Input,
  Item,
  Label,
  List,
  Message,
  Segment,
  Header,
} from "semantic-ui-react";
import { BucketAggregation, Toggle } from "react-searchkit";
import _find from "lodash/find";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import Overridable from "react-overridable";
import { SearchBar } from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SearchItemCreators } from "../utils";

export const RDMRecordResultsListItem = ({ result, index }) => {
  const access_status_id = _get(result, "ui.access_status.id", "open");
  const access_status = _get(result, "ui.access_status.title_l10n", "Open");
  const access_status_icon = _get(result, "ui.access_status.icon", "unlock");
  const createdDate = _get(
    result,
    "ui.created_date_l10n_long",
    "No creation date found."
  );
  const creators = result.ui.creators.creators.slice(0, 3);

  const description_stripped = _get(
    result,
    "ui.description_stripped",
    "No description"
  );

  const publicationDate = _get(
    result,
    "ui.publication_date_l10n_long",
    "No publication date found."
  );
  const resource_type = _get(
    result,
    "ui.resource_type.title_l10n",
    "No resource type"
  );
  const subjects = _get(result, "ui.subjects", []);
  const title = _get(result, "metadata.title", "No title");
  const version = _get(result, "ui.version", null);

  // Derivatives
  const viewLink = `/records/${result.id}`;
  return (
    <Item key={index}>
      <Item.Content>
        <Item.Extra className="labels-actions">
          <Label size="tiny" color="blue">
            {publicationDate} ({version})
          </Label>
          <Label size="tiny" color="grey">
            {resource_type}
          </Label>
          <Label size="tiny" className={`access-status ${access_status_id}`}>
            {access_status_icon && (
              <i className={`icon ${access_status_icon}`}></i>
            )}
            {access_status}
          </Label>
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink}>{title}</a>
        </Item.Header>
        <Item.Meta className="creatibutors">
          <SearchItemCreators creators={creators} />
        </Item.Meta>
        <Item.Description>
          {_truncate(description_stripped, { length: 350 })}
        </Item.Description>
        <Item.Extra>
          {subjects.map((subject, index) => (
            <Label key={index} size="tiny">
              {subject.title_l10n}
            </Label>
          ))}
          {createdDate && (
            <div>
              <small>
                {i18next.t("Uploaded on")} <span>{createdDate}</span>
              </small>
            </div>
          )}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

// TODO: Update this according to the full List item template?
export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description_stripped = _get(
    result,
    "ui.description_stripped",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/records/${result.pid}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(description_stripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export const RDMRecordSearchBarContainer = () => {
  return (
    <Overridable id={"SearchApp.searchbar"}>
      <SearchBar />
    </Overridable>
  );
};

export const RDMRecordSearchBarElement = ({
  placeholder: passedPlaceholder,
  queryString,
  onInputChange,
  executeSearch,
}) => {
  const placeholder = passedPlaceholder || i18next.t("Search");
  const onBtnSearchClick = () => {
    executeSearch();
  };
  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };
  return (
    <Input
      action={{
        icon: "search",
        onClick: onBtnSearchClick,
        className: "search",
        "aria-label": "Search",
      }}
      fluid
      placeholder={placeholder}
      onChange={(event, { value }) => {
        onInputChange(value);
      }}
      value={queryString}
      onKeyPress={onKeyPress}
    />
  );
};

export const RDMRecordFacetsValues = ({
  bucket,
  isSelected,
  onFilterClicked,
  getChildAggCmps,
}) => {
  const childAggCmps = getChildAggCmps(bucket);
  const [isActive, setisActive] = useState(false);
  const hasChildren = childAggCmps && childAggCmps.props.buckets.length > 0;
  const keyField = bucket.key_as_string ? bucket.key_as_string : bucket.key;
  return (
    <List.Item key={bucket.key}>
      <div
        className={`facet-wrapper title ${
          hasChildren ? "" : "facet-subtitle"
        } ${isActive ? "active" : ""}`}
      >
        <List.Content className="facet-count">
          <Label circular id={`${keyField}-count`}>
            {bucket.doc_count}
          </Label>
        </List.Content>
        {hasChildren ? (
          <button className="iconhold"
                  onClick={() => setisActive(!isActive)}
                  aria-label={`${isActive ? i18next.t("hide subfacets") : i18next.t("show subfacets") }`}
            >
              <i className={`angle ${isActive ? "down" : "right"} icon`}></i>
          </button>
        ) : null}
        <Checkbox
          label={bucket.label || keyField}
          id={`${keyField}-facet-checkbox`}
          aria-describedby={`${keyField}-count`}
          value={keyField}
          onClick={() => onFilterClicked(keyField)}
          checked={isSelected}
        />
      </div>
      <div className={`content facet-content ${isActive ? "active" : ""}`}>
        {childAggCmps}
      </div>
    </List.Item>
  );
};

export const SearchHelpLinks = () => {
  return (
    <Overridable id={"RdmSearch.SearchHelpLinks"}>
      <Grid className="padded-small">
        <Grid.Row className="no-padded">
          <Grid.Column></Grid.Column>
        </Grid.Row>
        <Grid.Row className="no-padded">
          <Grid.Column>
            <Card className="borderless-facet">
              <Card.Content>
                <a href="/help/search">{i18next.t("Search guide")}</a>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Overridable>
  );
};

export const RDMRecordFacets = ({ aggs, currentResultsState }) => {
  return (
    <aside aria-label={i18next.t("filters")} id="search-filters">
      <Toggle
        title={i18next.t("Versions")}
        label={i18next.t("View all versions")}
        filterValue={["allversions", "true"]}
      />
      {aggs.map((agg) => {
        return (
          <div className="ui accordion" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}
      <SearchHelpLinks />
    </aside>
  );
};

export const RDMBucketAggregationElement = ({ title, containerCmp }) => {
  return (
    <Card className="borderless-facet">
      <Card.Content>
        <Card.Header>{title}</Card.Header>
      </Card.Content>
      <Card.Content>{containerCmp}</Card.Content>
    </Card>
  );
};

export const RDMToggleComponent = ({
  updateQueryFilters,
  userSelectionFilters,
  filterValue,
  label,
  title,
  isChecked,
}) => {
  const _isChecked = (userSelectionFilters) => {
    const isFilterActive =
      userSelectionFilters.filter((filter) => filter[0] === filterValue[0])
        .length > 0;
    return isFilterActive;
  };

  const onToggleClicked = () => {
    updateQueryFilters(filterValue);
  };

  var isChecked = _isChecked(userSelectionFilters);
  return (
    <Card className="borderless-facet">
      <Card.Content>
        <Card.Header>{title}</Card.Header>
      </Card.Content>
      <Card.Content>
        <Checkbox
          toggle
          label={label}
          name="versions-toggle"
          id="versions-toggle"
          onClick={onToggleClicked}
          checked={isChecked}
        />
      </Card.Content>
    </Card>
  );
};

export const RDMCountComponent = ({ totalResults }) => {
  return <Label>{totalResults.toLocaleString("en-US")}</Label>;
};

export const RDMEmptyResults = (props) => {
  const queryString = props.queryString;
  return (
    <>
      <Segment placeholder textAlign="center">
        <Header icon>
          <Icon name="search" />
          {i18next.t("No results found!")}
        </Header>
        {queryString && (
          <em>
            {i18next.t("Current search")} "{queryString}"
          </em>
        )}
        <br />
        <Button primary onClick={() => props.resetQuery()}>
          {i18next.t("Clear query")}
        </Button>
      </Segment>
    </>
  );
};

export const RDMErrorComponent = ({ error }) => {
  return (
    <Message warning>
      <Message.Header>
        <Icon name="warning sign" />
        {error.response.data.message}
      </Message.Header>
    </Message>
  );
};
