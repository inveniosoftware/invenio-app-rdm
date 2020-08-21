// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { overrideStore } from "react-overridable";
import {
  Icon,
  Card,
  Checkbox,
  Grid,
  Label,
  Input,
  Item,
} from "semantic-ui-react";
import _ from "lodash";
import _truncate from "lodash/truncate";

const RDMRecordResultsListItem = ({ result, index }) => {
  const startDate = _.get(result, "metadata.dates[0].start", "No metadata");
  const status = _.get(
    result,
    "metadata.resource_type.type",
    "No resource type"
  );
  const access = _.get(
    result,
    "metadata._default_preview",
    "No default preview"
  );
  const creatorName = _.get(result, "metadata.creators[0].name", "No creator");
  const updatedDate = _.get(result, "metadata.embargo_date", "No updated date"); // FIXME: probably wrong
  const title = _.get(result, "metadata.titles[0].title", "No title");
  const author = _.get(result, "metadata._internal_notes[0].user", "anonymous");

  return (
    <Item key={index} className="deposits-list-item">
      <Item.Content>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={1} className="checkbox-column">
              <Checkbox />
              {/* FIXME: prototype */}
              {Math.floor(Math.random() * Math.floor(2)) ? (
                <Icon name="check" color="green" />
              ) : (
                <Icon name="upload" color="red" />
              )}
            </Grid.Column>
            <Grid.Column width={15}>
              <Item.Extra>
                <div>
                  <Label size="tiny" color="blue">
                    {updatedDate}
                  </Label>
                  <Label size="tiny" color="grey">
                    {status}
                  </Label>
                  <Label size="tiny" color="green">
                    {access}
                  </Label>
                  <div className="ui right floated actions">
                    <a href="#">
                      <Icon name="code branch" />
                      New version
                    </a>
                    <a href="#">
                      <Icon name="edit" />
                      Edit
                    </a>
                    <a href="#">
                      <Icon name="trash" />
                      Delete
                    </a>
                  </div>
                </div>
              </Item.Extra>
              <Item.Header>{title}</Item.Header>
              <Item.Meta>{creatorName}</Item.Meta>
              <Item.Extra>
                <div>
                  Created on <span>{startDate}</span> by <span>{author}</span>
                  <div className="ui right floated stats">
                    <span>
                      <Icon name="eye" />
                      3,113
                    </span>
                    <span>
                      <Icon name="download" />
                      420
                    </span>
                    <span>
                      <Icon name="quote right" />
                      70
                    </span>
                  </div>
                </div>
              </Item.Extra>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Item.Content>
    </Item>
  );
};

export default RDMRecordResultsListItem;

overrideStore.add("ResultsList.item", RDMRecordResultsListItem);

// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

const RDMRecordResultsGridItem = ({ result, index }) => {
  const description = _.get(
    result,
    "metadata.descriptions[0].description",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/records/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.titles[0].title}</Card.Header>
        <Card.Description>
          {_truncate(description, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

overrideStore.add("ResultsGrid.item", RDMRecordResultsGridItem);

const RDMRecordSearchBarElement = ({
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

overrideStore.add("SearchBar.element", RDMRecordSearchBarElement);
