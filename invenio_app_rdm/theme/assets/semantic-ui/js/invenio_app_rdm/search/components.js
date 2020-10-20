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
} from "semantic-ui-react";
import _get from "lodash/get";
import _truncate from "lodash/truncate";

export const RDMRecordResultsListItem = ({ result, index }) => {
  const description = _get(
    result,
    "metadata.descriptions[0].description",
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
  const creatorName = _get(result, "metadata.creators[0].name", "No creator");
  const updatedDate = _get(result, "updated");
  const title = _get(result, "metadata.titles[0].title", "No title");

  return (
    <Item key={index} href={`/records/${result.id}`}>
      <Item.Content>
        <Item.Extra>
          <div>
            <Label size="tiny" color="blue">
              {publicationDate}
            </Label>
            <Label size="tiny" color="grey">
              {status}
            </Label>
            <Label
              size="tiny"
              className={`access-right ${access_right_category}`}
            >
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
          {updatedDate && (
            <div>
              Updated on <span>{updatedDate}</span>
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
    "metadata.descriptions[0].description",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/records/${result.pid}`}>
      <Card.Content>
        <Card.Header>{result.metadata.titles[0].title}</Card.Header>
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
  );
};
