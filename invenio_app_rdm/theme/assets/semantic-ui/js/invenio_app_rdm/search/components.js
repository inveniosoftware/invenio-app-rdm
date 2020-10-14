// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Card, Item, Input, Label, Button } from "semantic-ui-react";
import { BucketAggregation, withState } from "react-searchkit";
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
    "metadata.publication_date",
    "No metadata"
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

const _RDMRecordFacets = ({ aggs, currentResultsState }) => {
  const createValuesLabels = (uiAggConfig) => {
    return Object.keys(uiAggConfig).map((aggValue) => {
      return {
        label: uiAggConfig[aggValue],
        value: aggValue,
      };
    });
  };

  return (
    <>
      {aggs.map((agg) => {
        const valuesLabels = !currentResultsState.loading
          ? createValuesLabels(
              _get(currentResultsState.data.aggregations.ui, agg.field, {})
            )
          : [];
        return (
          <BucketAggregation
            key={agg.title}
            title={agg.title}
            agg={{
              field: agg.field,
              aggName: agg.aggName,
            }}
            valuesLabels={valuesLabels}
          />
        );
      })}
    </>
  );
};

export const RDMRecordFacets = withState(_RDMRecordFacets);
