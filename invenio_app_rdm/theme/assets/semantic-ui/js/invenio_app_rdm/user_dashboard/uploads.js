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
import React from "react";
import { Button, Card, Divider, Header, Segment } from "semantic-ui-react";
import { parametrize, overrideStore } from "react-overridable";
import {
  RDMCountComponent,
  RDMEmptyResults as RDMNoSearchResults,
  RDMRecordSearchBarElement,
  RDMToggleComponent,
} from "../search/components";
import { http } from "react-invenio-forms";
import { DashboardResultView, DashboardSearchLayoutHOC } from "./base";
import { createSearchAppInit } from "@js/invenio_search_ui";
import { ComputerTabletUploadsItem } from "./uploads_items/ComputerTabletUploadsItem";
import { MobileUploadsItem } from "./uploads_items/MobileUploadsItem";
import PropTypes from "prop-types";
import {
  ContribSearchAppFacets,
  ContribBucketAggregationElement,
  ContribBucketAggregationValuesElement,
} from "@js/invenio_search_ui/components";

const statuses = {
  in_review: { color: "warning", title: i18next.t("In review") },
  declined: { color: "negative", title: i18next.t("Declined") },
  expired: { color: "expired", title: i18next.t("Expired") },
  draft_with_review: { color: "neutral", title: i18next.t("Draft") },
  draft: { color: "neutral", title: i18next.t("Draft") },
  new_version_draft: { color: "neutral", title: i18next.t("New version draft") },
};

export const RDMRecordResultsListItem = ({ result }) => {
  const editRecord = () => {
    http
      .post(
        `/api/records/${result.id}/draft`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/vnd.inveniordm.v1+json",
          },
        }
      )
      .then(() => {
        window.location = `/uploads/${result.id}`;
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const isPublished = result.is_published;
  const access = {
    accessStatusId: _get(result, "ui.access_status.id", i18next.t("open")),
    accessStatus: _get(result, "ui.access_status.title_l10n", i18next.t("Open")),
    accessStatusIcon: _get(result, "ui.access_status.icon", i18next.t("unlock")),
  };
  const uiMetadata = {
    descriptionStripped: _get(
      result,
      "ui.description_stripped",
      i18next.t("No description")
    ),
    title: _get(result, "metadata.title", i18next.t("No title")),
    creators: _get(result, "ui.creators.creators", []).slice(0, 3),
    subjects: _get(result, "ui.subjects", []),
    publicationDate: _get(
      result,
      "ui.publication_date_l10n_long",
      i18next.t("No publication date found.")
    ),
    resourceType: _get(
      result,
      "ui.resource_type.title_l10n",
      i18next.t("No resource type")
    ),
    createdDate: result.ui?.created_date_l10n_long,
    version: result.ui?.version ?? "",
    isPublished: isPublished,
    viewLink: isPublished ? `/records/${result.id}` : `/uploads/${result.id}`,
    publishingInformation: _get(result, "ui.publishing_information.journal", ""),
  };

  return (
    <>
      <ComputerTabletUploadsItem
        result={result}
        editRecord={editRecord}
        statuses={statuses}
        access={access}
        uiMetadata={uiMetadata}
      />
      <MobileUploadsItem
        result={result}
        editRecord={editRecord}
        statuses={statuses}
        access={access}
        uiMetadata={uiMetadata}
      />
    </>
  );
};

RDMRecordResultsListItem.propTypes = {
  result: PropTypes.object.isRequired,
};

// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const descriptionStripped = _get(result, "ui.description_stripped", "No description");
  return (
    <Card fluid key={index} href={`/records/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(descriptionStripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

RDMRecordResultsGridItem.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
};

export const RDMEmptyResults = (props) => {
  const { queryString } = props;
  return queryString === "" ? (
    <Segment.Group>
      <Segment placeholder textAlign="center" padded="very">
        <Header as="h1" align="center">
          <Header.Content>
            {i18next.t("Get started!")}
            <Header.Subheader>{i18next.t("Make your first upload!")}</Header.Subheader>
          </Header.Content>
        </Header>
        <Divider hidden />
        <Button
          positive
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

RDMEmptyResults.propTypes = {
  queryString: PropTypes.string.isRequired,
};

const appName = "InvenioAppRdm.DashboardUploads";

export const DashboardUploadsSearchLayout = DashboardSearchLayoutHOC({
  searchBarPlaceholder: i18next.t("Search in my uploads..."),
  newBtn: (
    <Button
      positive
      icon="upload"
      href="/uploads/new"
      content={i18next.t("New upload")}
      floated="right"
    />
  ),
  appName: appName,
});

const ContribSearchAppFacetsWithConfig = parametrize(ContribSearchAppFacets, {
  toggle: true,
});

const DashboardResultViewWAppName = parametrize(DashboardResultView, {
  appName: appName,
});

export const defaultComponents = {
  [`${appName}.BucketAggregation.element`]: ContribBucketAggregationElement,
  [`${appName}.BucketAggregationValues.element`]: ContribBucketAggregationValuesElement,
  [`${appName}.Count.element`]: RDMCountComponent,
  [`${appName}.EmptyResults.element`]: RDMEmptyResults,
  [`${appName}.ResultsList.item`]: RDMRecordResultsListItem,
  [`${appName}.ResultsGrid.item`]: RDMRecordResultsGridItem,
  [`${appName}.SearchApp.facets`]: ContribSearchAppFacetsWithConfig,
  [`${appName}.SearchApp.layout`]: DashboardUploadsSearchLayout,
  [`${appName}.SearchApp.results`]: DashboardResultViewWAppName,
  [`${appName}.SearchBar.element`]: RDMRecordSearchBarElement,
  [`${appName}.SearchFilters.Toggle.element`]: RDMToggleComponent,
};
const overriddenComponents = overrideStore.getAll();

createSearchAppInit(
  { ...defaultComponents, ...overriddenComponents },
  true,
  "invenio-search-config",
  true
);
