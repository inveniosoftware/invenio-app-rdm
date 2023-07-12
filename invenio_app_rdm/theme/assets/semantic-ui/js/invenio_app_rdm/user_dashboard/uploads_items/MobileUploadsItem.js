// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import PropTypes from "prop-types";
import _truncate from "lodash/truncate";
import _get from "lodash/get";
import { Dropdown, Icon, Item, Label } from "semantic-ui-react";
import { SearchItemCreators } from "../../utils";
import { CompactStats } from "../../components/CompactStats";

export const MobileUploadsItem = ({
  result,
  editRecord,
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
    <Icon name="check" className="positive mr-10" />
  ) : (
    <Icon name="upload" className="negative mr-10" />
  );
  const uniqueViews = _get(result, "stats.all_versions.unique_views", 0);
  const uniqueDownloads = _get(result, "stats.all_versions.unique_downloads", 0);
  return (
    <Item key={result.id} className="deposits-list-item mobile only flex">
      <Item.Content className="centered">
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
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink} className="truncate-lines-2">
            {icon}
            {title}
          </a>
        </Item.Header>
        <Item.Meta>
          <div className="creatibutors">
            <SearchItemCreators creators={creators} />
          </div>
        </Item.Meta>
        <Item.Description>
          {_truncate(descriptionStripped, {
            length: 100,
          })}
        </Item.Description>
        <Item.Extra>
          <Item.Extra>
            {subjects.map((subject) => (
              <Label key={subject.title_l10n} size="tiny">
                {subject.title_l10n}
              </Label>
            ))}
            <div>
              <small>
                {createdDate ? (
                  <>
                    {i18next.t("Uploaded on {{uploadDate}}", {
                      uploadDate: createdDate,
                    })}
                  </>
                ) : (
                  i18next.t("No creation date found.")
                )}
              </small>
              <small>
                {publishingInformation && (
                  <span>
                    {i18next.t("Published in: {{publishedIn}}", {
                      publishedIn: publishingInformation,
                    })}
                  </span>
                )}
              </small>
              <div className="rel-mt-1">
                <small>
                  <CompactStats
                    uniqueViews={uniqueViews}
                    uniqueDownloads={uniqueDownloads}
                  />
                </small>
              </div>
            </div>
          </Item.Extra>
        </Item.Extra>
        <Item.Extra>
          <Dropdown button text={i18next.t("Actions")} labeled className="icon">
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => editRecord()}
                labelPosition="left"
                icon="edit"
                content={i18next.t("Edit")}
              />

              {isPublished && (
                <Dropdown.Item
                  labelPosition="left"
                  href={viewLink}
                  icon="eye"
                  content={i18next.t("View")}
                />
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

MobileUploadsItem.propTypes = {
  result: PropTypes.object.isRequired,
  editRecord: PropTypes.func.isRequired,
  statuses: PropTypes.object.isRequired,
  access: PropTypes.object.isRequired,
  uiMetadata: PropTypes.object.isRequired,
};
