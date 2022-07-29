// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _truncate from "lodash/truncate";
import React from "react";
import { Button, Icon, Item, Label } from "semantic-ui-react";
import { SearchItemCreators } from "../../utils";
import PropTypes from "prop-types";

export const ComputerTabletUploadsItem = ({
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
  } = uiMetadata;

  const icon = isPublished ? (
    <Icon name="check" className="positive" />
  ) : (
    <Icon name="upload" className="negative" />
  );

  return (
    <Item key={result.id} className="deposits-list-item computer tablet only flex">
      <div className="status-icon mr-10">
        <Item.Content verticalAlign="top">
          <Item.Extra>{icon}</Item.Extra>
        </Item.Content>
      </div>
      <Item.Content>
        <Item.Extra className="labels-actions">
          {result.status in statuses && result.status !== "published" && (
            <Label size="tiny" className={statuses[result.status].color}>
              {statuses[result.status].title}
            </Label>
          )}
          <Label size="tiny" className="primary">
            {publicationDate} ({version})
          </Label>
          <Label size="tiny" className="neutral">
            {resourceType}
          </Label>
          <Label size="tiny" className={`access-status ${accessStatusId}`}>
            <i className={`icon ${accessStatusIcon}`} />
            {accessStatus}
          </Label>
          <Button
            compact
            size="small"
            floated="right"
            onClick={() => editRecord()}
            labelPosition="left"
            icon="edit"
            content={i18next.t("Edit")}
          />
          {isPublished && (
            <Button
              compact
              size="small"
              floated="right"
              href={viewLink}
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
        <Item.Description>
          {_truncate(descriptionStripped, {
            length: 350,
          })}
        </Item.Description>
        <Item.Extra>
          {subjects.map((subject) => (
            <Label key={subject.title_l10n} size="tiny">
              {subject.title_l10n}
            </Label>
          ))}
          <div>
            {}
            <small>
              {createdDate ? (
                <>
                  {i18next.t("Uploaded on")} <span>{createdDate}</span>
                </>
              ) : (
                i18next.t("No creation date found.")
              )}
            </small>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

ComputerTabletUploadsItem.propTypes = {
  result: PropTypes.object.isRequired,
  editRecord: PropTypes.func.isRequired,
  statuses: PropTypes.object.isRequired,
  access: PropTypes.object.isRequired,
  uiMetadata: PropTypes.object.isRequired,
};
