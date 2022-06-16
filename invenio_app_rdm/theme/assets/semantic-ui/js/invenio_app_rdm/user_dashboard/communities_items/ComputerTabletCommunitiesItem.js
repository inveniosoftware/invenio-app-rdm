// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import React from "react";
import { Image } from "react-invenio-forms";
import { Button, Icon, Item, Label } from "semantic-ui-react";

export const ComputerTabletCommunitiesItem = ({ result, index }) => {
  const community_type = result.ui?.type?.title_l10n;
  const visibility = result.access.visibility;
  const isPublic = visibility === "public";
  const visibilityColor = isPublic ? "green" : "red";
  const visibilityText = isPublic
    ? i18next.t("Public")
    : i18next.t("Restricted");
  const visibilityIcon = isPublic ? undefined : "ban";
  return (
    <Item key={index} className="computer tablet only flex">
      <Image
        wrapped
        src={result.links.logo}
        size="tiny"
        className="community-logo mt-auto mb-auto"
      />
      <Item.Content>
        <Item.Extra className="user-communities">
          {community_type && (
            <Label size="tiny" color="blue">
              <Icon name="tag" />
              {community_type}
            </Label>
          )}
          <Label size="tiny" color={visibilityColor}>
            {visibilityIcon && <Icon name={visibilityIcon} />}
            {visibilityText}
          </Label>
          <Button
            compact
            size="small"
            floated="right"
            href={`/communities/${result.id}/settings`}
            className="mt-0"
          >
            <Icon name="edit" />
            {i18next.t("Edit")}
          </Button>
        </Item.Extra>
        <Item.Header as="h2">
          <a href={`/communities/${result.id}`}>{result.metadata.title}</a>
        </Item.Header>
        <Item.Meta>
          <div
            className="truncate-lines-2"
            dangerouslySetInnerHTML={{
              __html: result.metadata.description,
            }}
          />
        </Item.Meta>
        <Item>
          {result.metadata.website && (
            <a
              href={result.metadata.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.metadata.website}
            </a>
          )}
        </Item>
      </Item.Content>
    </Item>
  );
};
