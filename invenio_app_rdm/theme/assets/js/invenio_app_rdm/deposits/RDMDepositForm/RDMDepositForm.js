import React, { Component } from "react";
import { Message, Container, Grid, Icon } from "semantic-ui-react";

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
    const vocabularies = this.config.vocabularies;

    return (
      <DepositFormApp
        controller={this.controller}
        record={this.state.record}
        config={this.config}
      >
        <ErrorMessage fieldPath="message" />
        <Grid columns={2}>
          <Grid.Column>
            <AccordionField
              fieldPath=""
              active={true}
              label={"Basic Information"}
              content={
                <div>
                  <TitlesField fieldPath="titles" label="Titles" />
                  <ResourceTypeField
                    fieldPath="resource_type"
                    // label={<span><Icon disabled name="tag" />Resource type</span>}
                    label={"Resource type"}
                    options={vocabularies.resource_type}
                  />
                </div>
              }
            />

            {/* header={<h3>Required Information</h3>} */}
          </Grid.Column>
          <Grid.Column>
            <SaveButton />
            <PublishButton />
          </Grid.Column>
        </Grid>
        {/* <PayloadPreviewer /> */}
        <RecordPreviewer />
      </DepositFormApp>
    );
  }
}
