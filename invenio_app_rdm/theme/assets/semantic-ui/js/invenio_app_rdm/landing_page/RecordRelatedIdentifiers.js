// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Grid } from "semantic-ui-react";

import { RELATED_IDENTIFIERS_RELATIONS } from "../deposit/RDMDepositForm";

export const RecordRelatedIdentifiers = (props) => {
  const { relatedIdentifiers } = props;
  return (
    <>
      {relatedIdentifiers.map((item) => {
        const { grouper: relationType, list: relations } = item;

        const title = RELATED_IDENTIFIERS_RELATIONS.find(
          (item) => item.value === relationType
        )?.text;

        return (
          <Grid relaxed columns={2} key={relationType}>
            <Grid.Column width={4}>
              <p>
                <b>{title}</b>
              </p>
            </Grid.Column>
            <Grid.Column width={12}>
              {relations.map(({ identifier, scheme }) => (
                <p
                  key={identifier}
                >{`${identifier} (${scheme.toUpperCase()})`}</p>
              ))}
            </Grid.Column>
          </Grid>
        );
      })}
    </>
  );
};
