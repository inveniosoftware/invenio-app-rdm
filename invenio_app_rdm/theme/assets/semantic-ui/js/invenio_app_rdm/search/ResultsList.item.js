// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Item } from "semantic-ui-react";
import _ from "lodash";
import _truncate from "lodash/truncate";

const RDMRecordResultsListItem = ({ result, index }) => {
  const description = _.get(
    result,
    "metadata.descriptions[0].description",
    "No description"
  );

  return (
    <Item key={index} href={`/records/${result.id}`}>
      <Item.Content>
        <Item.Header>{result.metadata.titles[0].title}</Item.Header>
        <Item.Description>
          {_truncate(description, { length: 200 })}
        </Item.Description>
      </Item.Content>
    </Item>
  );
};

export default RDMRecordResultsListItem;
