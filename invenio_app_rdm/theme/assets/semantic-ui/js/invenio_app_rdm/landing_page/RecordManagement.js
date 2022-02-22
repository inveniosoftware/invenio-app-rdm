// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Grid, Message, Divider } from "semantic-ui-react";

import { EditButton } from "./EditButton";
import { ShareButton } from "./ShareButton";
import { NewVersionButton } from "react-invenio-deposit";

export const RecordManagement = (props) => {
  const record = props.record;
  const recid = record.id;
  const permissions = props.permissions;
  const [error, setError] = useState("");
  const handleError = (errorMessage) => {
    console.log(errorMessage);
    setError(errorMessage);
  };

  return (
    <Grid relaxed>
      <Grid.Column>
        <Grid.Row className="record-management-row">
          <EditButton recid={recid} onError={handleError} />
        </Grid.Row>
        <Grid.Row className="record-management-row">
          <NewVersionButton
            style={{ display: "block" }}
            fluid
            record={record}
            onError={handleError}
            disabled={!permissions.can_new_version}
          />
        </Grid.Row>
        <Grid.Row className="record-management-row">
          {permissions.can_manage && (
            <ShareButton
              disabled={!permissions.can_update_draft}
              recid={recid}
            />
          )}
        </Grid.Row>
        {error && (
          <Grid.Row className="record-management-row">
            <Message negative>{error}</Message>
          </Grid.Row>
        )}
      </Grid.Column>
    </Grid>
  );
};
