// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from 'react';
import {Item} from 'semantic-ui-react';
import _truncate from 'lodash/truncate';

export function ResultsItemTemplate(record, index) {
  return (
    <Item key={index} href={`#`}>
      <Item.Content>
        <Item.Header>{record.metadata.titles[0].title}</Item.Header>
        <Item.Description>
          {_truncate(record.metadata.descriptions[0].description, { length: 200 })}
        </Item.Description>
      </Item.Content>
    </Item>
  )
};
