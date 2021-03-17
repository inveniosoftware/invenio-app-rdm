// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Grid, Icon } from "semantic-ui-react";

import { EditButton } from "./EditButton";
import { NewVersionButton } from "./NewVersionButton";


export const RecordManagement = (props) => {
  const recid = props.recid;
  const permissions = props.permissions;
  const [error, setError] = useState("");
  const handleError = (errorMessage) => {
    console.log(errorMessage);
    setError(errorMessage);
  }

  return (
    <Grid relaxed>
      <Grid.Column>
        <Grid.Row>
          <Icon name="cogs" />
          <span>Manage</span>
        </Grid.Row>
        <Grid.Row className="record-management-row">
          { permissions.can_edit && <EditButton recid={recid} onError={handleError} /> }
          { permissions.can_edit && <NewVersionButton recid={recid} onError={handleError} /> }
        </Grid.Row>
        { error &&
        <Grid.Row className="record-management-row">
          <p>{error}</p>
        </Grid.Row>
        }
      </Grid.Column>
    </Grid>
  );
};
