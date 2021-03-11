// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import axios from "axios";
import { Grid, Icon, Button } from "semantic-ui-react";

import { NewVersionButton } from "./NewVersionButton";


export const RecordManagement = (props) => {
  const recid = props.recid;
  const permissions = props.permissions;
  const [error, setError] = useState("");
  const editRecord = () => {
    axios
      .post(`/api/records/${recid}/draft`)
      .then((response) => {
        window.location = `/uploads/${recid}`;
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };
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
        <Grid.Row className="record-management-buttons">
          <Button color="orange" size="mini" onClick={() => editRecord()}>
            <Icon name="edit" />
            Edit
          </Button>
          { permissions.can_manage && <NewVersionButton recid={recid} onError={handleError} /> }
        </Grid.Row>
        { error &&
        <Grid.Row className="record-management-buttons">
          <p>{error}</p>
        </Grid.Row>
        }
      </Grid.Column>
    </Grid>
  );
};
