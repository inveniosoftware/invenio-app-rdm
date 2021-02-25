// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import {
  Icon,
  Card,
  Container,
  Grid,
  Label,
  Item,
  Button,
  Segment,
  Header,
  Divider,
} from "semantic-ui-react";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import {
  Count,
  EmptyResults,
  Pagination,
  ResultsList,
  Sort,
  SearchBar,
  ResultsPerPage,
} from "react-searchkit";
import {
  SearchAppFacets,
  SearchAppResultsPane,
} from "@js/invenio_search_ui/components";

import axios from "axios";

export const RDMDepositResults = ({
  sortOptions,
  paginationOptions,
  currentResultsState,
}) => {
  const { total } = currentResultsState.data;
  return (
    total && (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Grid>
                <Grid.Row
                  verticalAlign="middle"
                  className="small padding-tb-5 deposit-result-header"
                >
                  <Grid.Column width={4}>
                    <Count label={() => <>{total} result(s) found</>} />
                  </Grid.Column>
                  <Grid.Column
                    width={12}
                    textAlign="right"
                    className="padding-r-5"
                  >
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
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign="middle">
          <Grid.Column width={4}></Grid.Column>
          <Grid.Column width={8} textAlign="center">
            <Pagination
              options={{
                size: "mini",
                showFirst: false,
                showLast: false,
              }}
            />
          </Grid.Column>
          <Grid.Column textAlign="right" width={4}>
            <ResultsPerPage
              values={paginationOptions.resultsPerPage}
              label={(cmp) => <> {cmp} results per page</>}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  );
};

export const RDMRecordResultsListItem = ({ result, index }) => {
  // TODO: Enable Access Right badge
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
  const creators = _get(result, "ui.creators.creators", []).slice(0, 3);
  const description = _get(result, "metadata.description", "No description");
  const publicationDate = _get(
    result,
    "ui.publication_date_l10n_long",
    "No publication date found."
  );
  const resource_type = _get(result, "ui.resource_type", "No resource type");
  const title = _get(result, "metadata.title", "No title");
  const subjects = _get(result, "metadata.subjects", []);
  const version = _get(result, "metadata.version", null);
  const status = result.status;
  const published = result.published;

  // Derivatives
  const editRecord = () => {
    axios
      .post(`/api/records/${result.id}/draft`)
      .then((response) => {
        window.location = `/uploads/${result.id}`;
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
  const viewLink = `/records/${result.id}`;

  return (
    <Item
      key={index}
      className="deposits-list-item"
      style={{ cursor: "default" }}
    >
      <div className="status-icon">
        <Item.Content verticalAlign="top">
          <Item.Extra>
            {status === "draft" && <Icon name="upload" color="red" />}
            {status === "published" && <Icon name="check" color="green" />}{" "}
          </Item.Extra>
        </Item.Content>
      </div>
      <Item.Content style={{ cursor: "default" }}>
        <Item.Extra>
          <div>
            {" "}
            {/* For reduced spacing between labels. */}
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
            <Button basic floated="right" onClick={() => editRecord()}>
              <Icon name="edit" />
              Edit
            </Button>
            {published === true && (
              <Button
                basic
                floated="right"
                onClick={() => (window.location.href = viewLink)}
              >
                <Icon name="eye" />
                View
              </Button>
            )}
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
  const queryString = props.queryString;
  return queryString === "" ? (
    <Segment.Group>
      <Segment placeholder textAlign="center" padded="very">
        <Header as="h1" align="center">
          <Header.Content>
            Get started!
            <Header.Subheader>
              Make your first upload!
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider hidden />
        <Button
          color="green"
          icon="upload"
          floated="right"
          href="/uploads/new"
          content="New upload"
        />
      </Segment>
    </Segment.Group>
  ) : (
    <Segment placeholder textAlign="center">
      <Header icon>
        <Icon name="search" />
        No results found!
      </Header>
      {queryString && <em>Current search "{queryString}"</em>}
      <br />
      <Button primary onClick={() => props.resetQuery()}>
        Clear query
      </Button>
    </Segment>
  );
};

export const RDMUserRecordsSearchLayout = (props) => (
  <Container>
    <Grid>
      <Grid.Row columns={3}>
        <Grid.Column width={4} />
        <Grid.Column width={8}>
          <SearchBar placeholder="Search uploads..." />
        </Grid.Column>
        <Grid.Column width={4}>
          <Button
            color="green"
            icon="upload"
            href="/uploads/new"
            content="New upload"
            floated="right"
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={4}>
          <SearchAppFacets aggs={props.config.aggs} />
        </Grid.Column>
        <Grid.Column width={12}>
          <SearchAppResultsPane layoutOptions={props.config.layoutOptions} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </Container>
);
