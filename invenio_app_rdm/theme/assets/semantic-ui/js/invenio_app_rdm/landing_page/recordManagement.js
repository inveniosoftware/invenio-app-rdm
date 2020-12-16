// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { Grid, Icon, Button } from 'semantic-ui-react'


const domContainer = document.getElementById("recordManagement");
const recid = JSON.parse(domContainer.dataset.recid);
const RecordManagement = () => {

  var editRecord = () => {
    axios
      .post(`/api/records/${recid}/draft`)
      .then(response => {
        window.location = `/uploads/${recid}`;
      })
      .catch(error => {
        console.log(error.response.data);
      })
  }

  return (
    <div class="reverse-header-margin">
      <div class="ui warning flashed message">
        <div class="ui container">
          <Grid padded relaxed>
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
                <Button color="green" size="mini" disabled>
                  <Icon name="clone" />
                  New Version
                </Button>
              </Grid.Row>
            </Grid.Column>
          </Grid>
        </div>
      </div>
    </div>
  )
}

ReactDOM.render(<RecordManagement />, document.getElementById("recordManagement"));
