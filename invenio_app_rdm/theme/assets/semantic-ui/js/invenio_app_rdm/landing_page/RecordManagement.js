// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Grid, Message } from "semantic-ui-react";

import { EditButton } from "./EditButton";
import { ShareButton } from "./ShareButton";
import { NewVersionButton } from "react-invenio-deposit";

export const RecordManagement = ({ record, permissions }) => {
  const { id: recid } = record;
  const [error, setError] = useState("");
  const handleError = (errorMessage) => {
    console.log(errorMessage);
    setError(errorMessage);
  };

  return (
    <Grid columns={1} className="record-management">
      <Grid.Column>
        <EditButton recid={recid} onError={handleError} />
      </Grid.Column>
      <Grid.Column>
        <NewVersionButton
          fluid
          size="medium"
          record={record}
          onError={handleError}
          disabled={!permissions.can_new_version}
        />
      </Grid.Column>
      <Grid.Column>
        {permissions.can_manage && (
          <ShareButton disabled={!permissions.can_update_draft} recid={recid} />
        )}
      </Grid.Column>
      {error && (
        <Grid.Row className="record-management">
          <Grid.Column>
            <Message negative>{error}</Message>
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
};
