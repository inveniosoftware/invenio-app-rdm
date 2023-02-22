// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _truncate from "lodash/truncate";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import PropTypes from "prop-types";

import { Item, Button } from "semantic-ui-react";
import { Image } from "react-invenio-forms";
import { RestrictedLabel } from "../RestrictedLabel";

export const CommunityItem = ({ result }) => (
  <Item key={result.id} className="justify-space-between">
    <Image size="mini" src={result.links.logo} />

    <Item.Content verticalAlign="middle">
      <Item.Header as="h3" className="ui small header flex align-items-center mb-5">
        <a href={result.links.self_html} className="p-0">
          {result.metadata.title}
        </a>

        <RestrictedLabel visibility={result.access.visibility} />
      </Item.Header>

      <Item.Description
        dangerouslySetInnerHTML={{
          __html: _truncate(result.metadata.description, { length: 50 }),
        }}
      />
    </Item.Content>

    <div className="flex align-items-center">
      <Button
        disabled
        size="tiny"
        negative
        labelPosition="left"
        icon="trash"
        content={i18next.t("Remove")}
      />
    </div>
  </Item>
);

CommunityItem.propTypes = {
  result: PropTypes.object.isRequired,
};
