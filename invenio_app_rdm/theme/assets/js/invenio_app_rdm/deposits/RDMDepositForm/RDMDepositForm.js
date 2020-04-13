import React, { Component } from "react";
import { Message, Container, Grid } from "semantic-ui-react";

import { RDMDepositApiClient } from "./RDMDepositAPIClient";
import { RDMDepositApiController } from "./RDMDepositApiController";
import {
  DepositFormApp,
  PublishButton,
  SaveButton,
  connect,
} from "../../../react_invenio_deposit";

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
    this.controller = new RDMDepositApiController(new RDMDepositApiClient());
    this.state = {
      record: props.record || {},
    };
  }

  render() {
    return (
      <DepositFormApp
        apiController={this.controller}
        record={this.state.record}
        config={this.config}
      >
        <RecordPreviewer />
        <Grid columns={2}>
          <Grid.Column>
            {
              // Insert form fields here
            }
          </Grid.Column>
          <Grid.Column>
            <Container>
              <PublishButton />
              <SaveButton />
            </Container>
          </Grid.Column>
        </Grid>
      </DepositFormApp>
    );
  }
}
