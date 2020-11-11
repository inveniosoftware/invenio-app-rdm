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
  const resource_type = _get(result, "ui.resource_type", "No resource type");
  const publicationDate = _get(
    result,
    "ui.publication_date_l10n_long",
    "No publication date found."
  );
  const createdDate = _get(
    result,
    "ui.created_date_l10n_long",
    "No creation date found."
  );
  const access = _get(result, "ui.access_right.title", "Open Access");
  const access_right_category = _get(
    result,
    "ui.access_right.category",
    "open"
  );
  const access_right_icon = _get(result, "ui.access_right.icon", "open");
  const creator = result.ui.creators.creators[0];
  const title = _get(result, "metadata.title", "No title");
  const author = _get(result, "metadata._internal_notes[0].user", "anonymous");
  const id = _get(result, "id");
  const EditLink = `/uploads/${id}`;
  const version = _get(result, "metadata.version", null);

  return (
    <Item key={index} href={EditLink} className="deposits-list-item">
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
                    {publicationDate} {version ? `(${version})` : null}
                  </Label>
                  <Label size="tiny" color="grey">
                    {resource_type}
                  </Label>
                  <Label
                    size="tiny"
                    className={`access-right ${access_right_category}`}
                  >
                    <i className={`icon ${access_right_icon}`}></i>
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
              <Item.Extra>
                <div>
                  Created on <span>{createdDate}</span> by {creator.name}
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
