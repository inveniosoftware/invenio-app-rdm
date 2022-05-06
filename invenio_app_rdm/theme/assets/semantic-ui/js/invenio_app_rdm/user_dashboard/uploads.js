// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { useState } from "react";
import {
  Button,
  Card,
  Divider,
  Header,
  Icon,
  Item,
  Label,
  Modal,
  Segment,
} from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMCountComponent,
  RDMEmptyResults as RDMNoSearchResults,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  RDMToggleComponent,
} from "../search/components";
import { axiosWithconfig, SearchItemCreators } from "../utils";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";
import { createSearchAppInit } from "@js/invenio_search_ui";

const statuses = {
  in_review: { color: "yellow", title: i18next.t("In review") },
  declined: { color: "red", title: i18next.t("Declined") },
  expired: { color: "orange", title: i18next.t("Expired") },
  draft_with_review: { color: "grey", title: i18next.t("Draft") },
  draft: { color: "grey", title: i18next.t("Draft") },
  new_version_draft: { color: "grey", title: i18next.t("New version draft") },
};

export const RDMRecordResultsListItem = ({ result, index }) => {
  const access_status_id = _get(result, "ui.access_status.id", "open");
  const access_status = _get(result, "ui.access_status.title_l10n", "Open");
  const access_status_icon = _get(result, "ui.access_status.icon", "unlock");
  const createdDate = _get(
    result,
    "ui.created_date_l10n_long",
    i18next.t("No creation date found.")
  );
  const creators = _get(result, "ui.creators.creators", []).slice(0, 3);

  const description_stripped = _get(
    result,
    "ui.description_stripped",
    i18next.t("No description")
  );

  const publicationDate = _get(
    result,
    "ui.publication_date_l10n_long",
    i18next.t("No publication date found.")
  );
  const resource_type = _get(
    result,
    "ui.resource_type.title_l10n",
    i18next.t("No resource type")
  );
  const title = _get(result, "metadata.title", i18next.t("No title"));
  const subjects = _get(result, "ui.subjects", []);
  const version = _get(result, "ui.version", null);
  const is_published = result.is_published;

  // Derivatives
  const editRecord = () => {
    axiosWithconfig
      .post(`/api/records/${result.id}/draft`)
      .then((response) => {
        window.location = `/uploads/${result.id}`;
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const viewLink = is_published
    ? `/records/${result.id}`
    : `/uploads/${result.id}`;
  return (
    <Item key={index} className="deposits-list-item mb-20">
      <div className="status-icon mr-10">
        <Item.Content verticalAlign="top">
          <Item.Extra>
            {is_published ? (
              <Icon name="check" color="green" />
            ) : (
              <Icon name="upload" color="red" />
            )}
          </Item.Extra>
        </Item.Content>
      </div>
      <Item.Content style={{ cursor: "default" }}>
        <Item.Extra className="labels-actions">
          {/* For reduced spacing between labels. */}
          {result.status in statuses && result.status !== "published" && (
            <Label size="tiny" color={statuses[result.status].color}>
              {statuses[result.status].title}
            </Label>
          )}
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
          <Button
            compact
            size="small"
            floated="right"
            onClick={() => editRecord()}
          >
            <Icon name="edit" />
            {i18next.t("Edit")}
          </Button>
          {is_published && (
            <Button compact size="small" floated="right" href={viewLink}>
              <Icon name="eye" />
              {i18next.t("View")}
            </Button>
          )}
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink}>{title}</a>
        </Item.Header>
        <Item.Meta>
          <div className="creatibutors">
            <SearchItemCreators creators={creators} />
          </div>
        </Item.Meta>
        <Item.Description>
          {_truncate(description_stripped, {
            length: 350,
          })}
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

// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description_stripped = _get(
    result,
    "ui.description_stripped",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/records/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(description_stripped, { length: 200 })}
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
            {i18next.t("Get started!")}
            <Header.Subheader>
              {i18next.t("Make your first upload!")}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Divider hidden />
        <Button
          color="green"
          icon="upload"
          floated="right"
          href="/uploads/new"
          content={i18next.t("New upload")}
        />
      </Segment>
    </Segment.Group>
  ) : (
    <Segment padded="very">
      <RDMNoSearchResults {...props} searchPath="/me/uploads" />
    </Segment>
  );
};

export const DashboardUploadsSearchLayout = DashboardSearchLayoutHOC({
  searchBarPlaceholder: i18next.t("Search uploads..."),
  newBtn: (
    <Button
      positive
      icon="upload"
      href="/uploads/new"
      content={i18next.t("New upload")}
      floated="right"
    />
  ),
});

export const defaultComponents = {
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "Count.element": RDMCountComponent,
  "EmptyResults.element": RDMEmptyResults,
  "ResultsList.item": RDMRecordResultsListItem,
  "ResultsGrid.item": RDMRecordResultsGridItem,
  "SearchApp.facets": RDMRecordFacets,
  "SearchApp.layout": DashboardUploadsSearchLayout,
  "SearchApp.results": DashboardResultView,
  "SearchBar.element": RDMRecordSearchBarElement,
  "SearchFilters.Toggle.element": RDMToggleComponent,
};

createSearchAppInit(defaultComponents);
