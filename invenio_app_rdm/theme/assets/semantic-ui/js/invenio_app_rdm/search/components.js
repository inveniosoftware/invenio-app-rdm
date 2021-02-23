// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
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
} from "semantic-ui-react";
import { BucketAggregation, Toggle } from "react-searchkit";
import _find from "lodash/find";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import Overridable from "react-overridable";
import { SearchBar } from "@js/invenio_search_ui/components";

export const RDMRecordResultsListItem = ({ result, index }) => {
  // TODO: Enable Access_Right badge
  // const access = _get(result, "ui.access_right.title", "Open Access");
  // const access_right_category = _get(
  //   result,
  //   "ui.access_right.category",
  //   "open"
  // );
  // const access_right_icon = _get(result, "ui.access_right.icon", "open");
  const createdDate = _get(
    result,
    "ui.created_date_l10n_long",
    "No creation date found."
  );
  const creators = result.ui.creators.creators.slice(0, 3);
  const description = _get(result, "metadata.description", "No description");
  const publicationDate = _get(
    result,
    "ui.publication_date_l10n_long",
    "No publication date found."
  );
  const resource_type = _get(result, "ui.resource_type", "No resource type");
  const subjects = _get(result, "metadata.subjects", []);
  const title = _get(result, "metadata.title", "No title");
  const version = _get(result, "metadata.version", null);

  // Derivatives
  const viewLink = `/records/${result.id}`;

  return (
    <Item key={index} href={viewLink}>
      <Item.Content>
        <Item.Extra>
          <div>
            <Label size="tiny" color="blue">
              {publicationDate} {version ? `(${version})` : null}
            </Label>
            <Label size="tiny" color="grey">
              {resource_type}
            </Label>
            {/* temporary: February release removal
                TODO: Re-enable in next releases*/}
            {/* <Label
              size="tiny"
              className={`access-right ${access_right_category}`}
            >
              <i className={`icon tiny ${access_right_icon}`}></i>
              {access}
            </Label> */}
            <Button basic floated="right">
              <Icon name="eye" />
              View
            </Button>
          </div>
        </Item.Extra>
        <Item.Header>{title}</Item.Header>
        <Item.Meta>
          {creators.map((creator, index) => (
            <span key={index}>
              {_get(creator, "person_or_org.identifiers", []).some(
                (identifier) => identifier.scheme === "orcid"
              ) && (
                <img className="inline-orcid" src="/static/images/orcid.svg" />
              )}
              {creator.person_or_org.name}
              {index < creators.length - 1 && ","}
            </span>
          ))}
        </Item.Meta>
        <Item.Description>
          {_truncate(description.replace(/(<([^>]+)>)/gi, ""), { length: 350 })}
        </Item.Description>
        <Item.Extra>
          {subjects.map((subject, index) => (
            <Label key={index} size="tiny">
              {subject.subject}
            </Label>
          ))}
          {createdDate && (
            <div>
              <small>
                Uploaded on <span>{createdDate}</span>
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
  const description = _get(result, "metadata.description", "No description");
  return (
    <Card fluid key={index} href={`/records/${result.pid}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(description, { length: 200 })}
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
  const placeholder = passedPlaceholder || "Search";
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
        className={`title ${hasChildren ? "" : "facet-subtitle"} ${
          isActive ? "active" : ""
        }`}
      >
        <List.Content floated="right">
          <Label circular>{bucket.doc_count}</Label>
        </List.Content>
        {hasChildren ? (
          <i
            className={`angle ${isActive ? "down" : "right"} icon`}
            onClick={() => setisActive(!isActive)}
          ></i>
        ) : null}
        <Checkbox
          label={bucket.label || keyField}
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

const SearchHelpLinks = () => {
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
                <a href="/help/search">Search guide</a>
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
    <>
      {/* TODO: uncomment once versioning is working */}
      {/* <Toggle
        title="Versions"
        label="View all versions"
        filterValue={["all_versions", "true"]}
      /> */}
      {aggs.map((agg) => {
        return (
          <div className="ui accordion" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}
      <SearchHelpLinks />
    </>
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
