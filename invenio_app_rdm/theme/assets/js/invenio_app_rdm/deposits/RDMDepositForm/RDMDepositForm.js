// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Message, Grid } from "semantic-ui-react";

import { RDMDepositApiClient } from "./RDMDepositAPIClient";
import { RDMDepositController } from "./RDMDepositController";
import {
  DepositFormApp,
  PublishButton,
  SaveButton,
  connect,
  TitlesField,
  ResourceTypeField,
} from "../../../react_invenio_deposit";
import { AccordionField, ErrorMessage } from "../../../react_invenio_forms";

class RecordPreviewer extends Component {
  render() {
    return (
      <Message>
        <Message.Header>Current record</Message.Header>
        <pre>{JSON.stringify(this.props.deposit.record, undefined, 2)}</pre>
      </Message>
    );
  }
}
RecordPreviewer = connect(RecordPreviewer);

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    this.controller = new RDMDepositController(new RDMDepositApiClient());
    this.state = {
      record: props.record || {},
    };
  }

  render() {
    const vocabularies = this.config.vocabularies || {};
    return (
      <DepositFormApp
        config={this.config}
        controller={this.controller}
        record={this.state.record}
      >
        <ErrorMessage fieldPath="message" />
        <Grid columns={2}>
          <Grid.Column>
            <AccordionField
              fieldPath=""
              active={true}
              label={"Basic Information"}
            >
              <div>
                <TitlesField fieldPath="titles" label="Titles" />
                <ResourceTypeField
                  fieldPath="resource_type"
                  label={"Resource type"}
                  options={vocabularies.resource_type}
                />
              </div>
            </AccordionField>
          </Grid.Column>
          <Grid.Column>
            <SaveButton />
            <PublishButton />
          </Grid.Column>
        </Grid>
        <RecordPreviewer />
      </DepositFormApp>
    );
  }
}
