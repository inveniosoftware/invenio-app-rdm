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
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Item,
  Label,
  Modal,
  Segment,
} from "semantic-ui-react";
import { axiosWithconfig, SearchItemCreators } from "../../utils";
import {
  RDMBucketAggregationElement,
  RDMCountComponent,
  RDMRecordFacets,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  RDMToggleComponent,
  RDMEmptyResults as RDMNoSearchResults
} from "../../search/components";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";

const DeleteDraftButton = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = () => setModalOpen(true);

  const handleClose = () => setModalOpen(false);

  const handleDelete = async () => {
    const resp = await axiosWithconfig.delete(
      `/api/records/${props.record.id}/draft`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    handleClose();
    window.location.reload();
  };

  return (
    <>
      <Button
        compact
        size="small"
        floated="right"
        color="red"
        onClick={handleOpen}
      >
        <Icon name="trash alternate outline" />
        {i18next.t("Delete")}
      </Button>

      <Modal open={modalOpen} onClose={handleClose} size="tiny">
        <Modal.Content>
          <h3>{i18next.t("Are you sure you want to delete this draft?")}</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleClose} floated="left">
            {i18next.t("Cancel")}
          </Button>
          <Button color="red" onClick={handleDelete}>
            {i18next.t("Delete")}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
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
    <Item key={index} className="deposits-list-item">
      <div className="status-icon">
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
          {is_published ? (
            <Button compact size="small" floated="right" href={viewLink}>
              <Icon name="eye" />
              {i18next.t("View")}
            </Button>
          ) : (
            <DeleteDraftButton record={result} />
          )}
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink}>{title}</a>
        </Item.Header>
        <Item.Meta className="creatibutors">
          <SearchItemCreators creators={creators} />
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
      <RDMNoSearchResults {...props} searchPath='/me/uploads' />
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
  "user-uploads-search.BucketAggregation.element": RDMBucketAggregationElement,
  "user-uploads-search.BucketAggregationValues.element": RDMRecordFacetsValues,
  "user-uploads-search.Count.element": RDMCountComponent,
  "user-uploads-search.EmptyResults.element": RDMEmptyResults,
  "user-uploads-search.ResultsList.item": RDMRecordResultsListItem,
  "user-uploads-search.ResultsGrid.item": RDMRecordResultsGridItem,
  "user-uploads-search.SearchApp.facets": RDMRecordFacets,
  "user-uploads-search.SearchApp.layout": DashboardUploadsSearchLayout,
  "user-uploads-search.SearchApp.results": DashboardResultView,
  "user-uploads-search.SearchBar.element": RDMRecordSearchBarElement,
  "user-uploads-search.SearchFilters.ToggleComponent": RDMToggleComponent,
};
