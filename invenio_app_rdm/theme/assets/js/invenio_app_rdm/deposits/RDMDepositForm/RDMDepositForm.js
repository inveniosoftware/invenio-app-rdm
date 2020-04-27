import React, { Component } from "react";
import { Message, Container, Grid, Icon } from "semantic-ui-react";

import { RDMDepositApiClient } from "./RDMDepositApiClient";
import { RDMDepositController } from "./RDMDepositController";
import {
  DepositFormApp,
  PublishButton,
  SaveButton,
  connect,
  TitlesField,
  ResourceTypeField,
} from "../../../react_invenio_deposit";
import { AccordionField } from "../../../react_invenio_forms";

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

class PayloadPreviewer extends Component {

  isNullEquivalent = (obj) => {
    // Identifies null equivalent obj
    if (obj === null) {
      return true;
    } else if (Array.isArray(obj)) {
      return obj.every(this.isNullEquivalent);
    } else if (typeof obj == 'object') {
      return Object.values(obj).every(this.isNullEquivalent)
    } else {
      return false;
    }
  }

  stripNullEquivalentFields = (obj) => {
    // Returns Object with top-level null equivalent fields stripped
    const result = {};

    for (const key of Object.keys(obj)) {
      if (!this.isNullEquivalent(obj[key])) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  render() {
    const payload = this.stripNullEquivalentFields(this.props.deposit.record);

    return (
      <Message>
        <Message.Header>Payload to send</Message.Header>
        <pre>{JSON.stringify(payload, undefined, 2)}</pre>
      </Message>
    );
  }
}
PayloadPreviewer = connect(PayloadPreviewer);


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
        apiController={this.controller}
        record={this.state.record}
        config={this.config}
      >
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
            <Container>
              <PublishButton />
              <SaveButton />
            </Container>
          </Grid.Column>
        </Grid>
        <PayloadPreviewer />
        <RecordPreviewer />
      </DepositFormApp>
    );
  }
}
