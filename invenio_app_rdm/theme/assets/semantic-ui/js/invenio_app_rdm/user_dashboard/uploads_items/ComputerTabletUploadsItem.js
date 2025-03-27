// This file is part of InvenioRDM
// Copyright (C) 2022-2024 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import { Button, Icon, Item, Label } from "semantic-ui-react";
import { SearchItemCreators } from "../../utils";
import { CompactStats } from "../../components/CompactStats";
import { DisplayPartOfCommunities } from "../../components/DisplayPartOfCommunities";

export const ComputerTabletUploadsItem = ({
  result,
  viewDraft,
  statuses,
  access,
  uiMetadata,
}) => {
  const { accessStatusId, accessStatus, accessStatusIcon } = access;
  const {
    descriptionStripped,
    title,
    creators,
    subjects,
    publicationDate,
    resourceType,
    createdDate,
    version,
    isPublished,
    viewLink,
    publishingInformation,
  } = uiMetadata;

  const icon = isPublished ? (
    <Icon name="check" className="positive" />
  ) : (
    <Icon name="upload" className="negative" />
  );
  const uniqueViews = _get(result, "stats.all_versions.unique_views", 0);
  const uniqueDownloads = _get(result, "stats.all_versions.unique_downloads", 0);

  return (
    <Item key={result.id} className="deposits-list-item computer tablet only flex">
      <div className="status-icon mr-10">
        <Item.Content verticalAlign="top">
          <Item.Extra>{icon}</Item.Extra>
        </Item.Content>
      </div>
      <Item.Content>
        {/* FIXME: Uncomment to enable themed banner */}
        {/* <DisplayVerifiedCommunity communities={result.parent?.communities} /> */}
        <Item.Extra className="labels-actions">
          {result.status in statuses && result.status !== "published" && (
            <Label horizontal size="small" className={statuses[result.status].color}>
              {statuses[result.status].title}
            </Label>
          )}
          <Label horizontal size="small" className="primary">
            {publicationDate} ({version})
          </Label>
          <Label horizontal size="small" className="neutral">
            {resourceType}
          </Label>
          <Label horizontal size="small" className={`access-status ${accessStatusId}`}>
            <i className={`icon ${accessStatusIcon}`} />
            {accessStatus}
          </Label>

          {isPublished ? (
            <Button
              compact
              size="small"
              floated="right"
              href={viewLink}
              labelPosition="left"
              icon="eye"
              content={i18next.t("View")}
            />
          ) : (
            <Button
              compact
              size="small"
              floated="right"
              onClick={() => viewDraft()}
              labelPosition="left"
              icon="eye"
              content={i18next.t("View")}
            />
          )}
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink} className="truncate-lines-2">
            {title}
          </a>
        </Item.Header>
        <Item.Meta>
          <div className="creatibutors">
            <SearchItemCreators creators={creators} />
          </div>
        </Item.Meta>
        <Item.Description className="truncate-lines-2">
          {descriptionStripped}
        </Item.Description>
        <Item.Extra>
          {subjects.map((subject) => (
            <Label key={subject.title_l10n} size="tiny">
              {subject.title_l10n}
            </Label>
          ))}

          <div className="flex justify-space-between align-items-end">
            <small>
              <DisplayPartOfCommunities communities={result.parent?.communities} />

              {createdDate ? (
                <>
                  {i18next.t("Uploaded on {{uploadDate}}", { uploadDate: createdDate })}
                </>
              ) : (
                i18next.t("No creation date found.")
              )}
              {publishingInformation && (
                <span>
                  {" "}
                  |{" "}
                  {i18next.t("Published in: {{- publishInfo }}", {
                    publishInfo: publishingInformation,
                  })}
                </span>
              )}
            </small>
            <small>
              <CompactStats
                uniqueViews={uniqueViews}
                uniqueDownloads={uniqueDownloads}
              />
            </small>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

ComputerTabletUploadsItem.propTypes = {
  result: PropTypes.object.isRequired,
  viewDraft: PropTypes.func.isRequired,
  statuses: PropTypes.object.isRequired,
  access: PropTypes.object.isRequired,
  uiMetadata: PropTypes.object.isRequired,
};
