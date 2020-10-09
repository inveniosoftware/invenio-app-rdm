// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import {
  Icon,
  Card,
  Checkbox,
  Grid,
  Label,
  Input,
  Item,
  Button,
  Segment,
  Header,
} from "semantic-ui-react";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import { Pagination, ResultsList, Sort, SearchBar } from "react-searchkit";

export const RDMDepositResults = ({ sortOptions, currentResultsState }) => {
  const { total } = currentResultsState.data;
  return (
    total && (
      <>
        <SearchBar />
        <Button
          color="green"
          icon="upload"
          floated="right"
          href="/uploads/new"
          content="New upload"
        />
        <Segment>
          <Grid>
            <Grid.Row verticalAlign="middle" className="header-row">
              <Grid.Column width={7}>
                {/* FIXME */}
                {/* <Checkbox label="Select all" /> */}
              </Grid.Column>
              <Grid.Column width={5} textAlign="right"></Grid.Column>
              <Grid.Column width={4} textAlign="right">
                {sortOptions && (
                  <Sort
                    values={sortOptions}
                    label={(cmp) => <>Sort by {cmp}</>}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <ResultsList />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row verticalAlign="middle" textAlign="center">
              <Grid.Column>
                <Pagination />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </>
    )
  );
};

export const RDMRecordResultsListItem = ({ result, index }) => {
  const createdDate = _get(result, "created", "No metadata");
  const status = _get(
    result,
    "metadata.resource_type.type",
    "No resource type"
  );
  const access = _get(result, "access.access_right", "Open access");
  const creatorName = _get(result, "metadata.creators[0].name", "No creator");
  const updatedDate = _get(result, "updated", "No updated date");
  const title = _get(result, "metadata.titles[0].title", "No title");
  const author = _get(result, "metadata._internal_notes[0].user", "anonymous");
  const id = _get(result, "id");
  const EditLink = `/uploads/${id}`;

  return (
    <Item key={index} className="deposits-list-item">
      <Item.Content>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={1} className="checkbox-column">
              <Icon name="upload" color="red" />
            </Grid.Column>
            <Grid.Column width={15}>
              <Item.Extra>
                <div>
                  <Label size="tiny" color="blue">
                    {updatedDate.substring(0, 10)}
                  </Label>
                  <Label size="tiny" color="grey">
                    {status}
                  </Label>
                  <Label size="tiny" color="green">
                    {access}
                  </Label>
                  <div className="ui right floated actions">
                    {/* FIXME */}
                    {/* <a href="#">
                      <Icon name="code branch" />
                      New version
                    </a> */}
                    <a href={EditLink}>
                      <Icon name="edit" />
                      Edit
                    </a>
                    {/* FIXME */}
                    {/* <a href="#">
                      <Icon name="trash" />
                      Delete
                    </a> */}
                  </div>
                </div>
              </Item.Extra>
              <Item.Header as="a" href={EditLink}>
                {title}
              </Item.Header>
              <Item.Meta>{creatorName}</Item.Meta>
              <Item.Extra>
                <div>
                  Created on <span>{createdDate.substring(0, 10)}</span> by{" "}
                  <span>{author}</span>
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

// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description = _get(
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

export const RDMEmptyResults = (props) => {
  return (
    <Segment placeholder textAlign="center">
      <Header icon>
        <Icon name="search" />
        No results found!
      </Header>
      <Button.Group>
        <Button primary onClick={() => props.resetQuery()}>
          Clear query
        </Button>
        <Button.Or />
        <Button
          color="green"
          icon="upload"
          floated="right"
          href="/uploads/new"
          content="New upload"
        />
      </Button.Group>
    </Segment>
  );
};
