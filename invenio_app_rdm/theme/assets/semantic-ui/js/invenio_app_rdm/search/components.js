// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import {
  Card,
  Item,
  Input,
  Label,
  Button,
  List,
  Checkbox,
  Grid
} from "semantic-ui-react";
import { BucketAggregation, withState, Toggle } from "react-searchkit";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import Overridable from 'react-overridable';

export const RDMRecordResultsListItem = ({ result, index }) => {
  const description = _get(
    result,
    "metadata.description",
    "No description"
  );
  const publicationDate = _get(
    result,
    "ui.publication_date_l10n",
    "No publication date found."
  );
  const status = _get(
    result,
    "metadata.resource_type.type",
    "No resource type"
  );
  const access = _get(result, "access.access_right", "No access rights");
  const access_right_category = _get(
    result,
    "ui.access_right.category",
    "open"
  );
  const access_right_icon = _get(
    result,
    "ui.access_right.icon",
    "open"
  );
  const creatorName = _get(result, "metadata.creators[0].name", "No creator");
  const updatedDate = _get(result, "updated");
  const title = _get(result, "metadata.title", "No title");
  const subjects = _get(
    result,
    "metadata.subjects",
    null
  );
  const version = _get(
    result,
    "metadata.version",
    null
  );
  return (
    <Item key={index} href={`/records/${result.id}`}>
      <Item.Content>
        <Item.Extra>
          <div>
            <Label size="tiny" color="blue">
              {publicationDate} {version ? `(${version})` : null}
            </Label>
            <Label size="tiny" color="grey">
              {status}
            </Label>
            <Label
              size="tiny"
              className={`access-right ${access_right_category}`}
            >
              <i className={`icon ${access_right_icon}`}></i>
              {access}
            </Label>
            <Button basic floated="right">
              View
            </Button>
          </div>
        </Item.Extra>
        <Item.Header>{title}</Item.Header>
        <Item.Meta>{creatorName}</Item.Meta>
        <Item.Description>
          {_truncate(description, { length: 350 })}
        </Item.Description>
        <Item.Extra>
          {subjects.map((subject, index) => (
            <Label key={index} size="tiny">
              {subject.subject}
            </Label>
          ))}
          {updatedDate && (
            <div>
              Updated on <span>{updatedDate.substring(0, 10)}</span>
            </div>
          )}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

// TODO: Update this according to the full List item template?
export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description = _get(
    result,
    "metadata.description",
    "No description"
  );
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
  return (
    <List.Item key={bucket.key}>
      <List.Content floated="right">
        <Label circular>{bucket.doc_count}</Label>
      </List.Content>
      <Checkbox
        label={bucket.label}
        value={bucket.key}
        onClick={() => onFilterClicked(bucket.key)}
        checked={isSelected}
      />
      {childAggCmps}
    </List.Item>
  )}


const SearchHelpLinks = () => {
  return (
    <Overridable
    id={'RdmSearch.SearchHelpLinks'}>
      <Grid className="searchHelpLinks">
      <Grid.Row >
        <a>Advanced search</a>
      </Grid.Row>
      <Grid.Row >
        <a>Search guide</a>
      </Grid.Row>
    </Grid>
    </Overridable>
  )
}

export const RDMRecordFacets = ({ aggs, currentResultsState }) => {

  return (
    <>
       <Toggle
        title="Versions"
        label="View all versions"
        filterValue={['all_versions', 'true']}
      />
      {aggs.map((agg) => {
        return (
          <BucketAggregation
            key={agg.title}
            title={agg.title}
            agg={agg}
          />
        );
      })}
      <SearchHelpLinks />
    </>
  );
};
