import React, { Component } from "react";
import { Message, Container, Grid, Icon } from "semantic-ui-react";

import { RDMDepositApiClient } from "./RDMDepositAPIClient";
import { RDMDepositApiController } from "./RDMDepositApiController";
import {
  DepositFormApp,
  PublishButton,
  SaveButton,
  connect,
} from "../../../react_invenio_deposit";
import { AccordionField, ArrayField, GroupField } from "../../../react_invenio_forms";
import { ResourceTypeField } from "./components";
import { ArrayTitlesItem } from "./components";

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
    const vocabularies = this.config.vocabularies;

    return (
      <DepositFormApp
        apiController={this.controller}
        record={this.state.record}
        config={this.config}
      >
        <RecordPreviewer />
        <Grid columns={2}>
          <Grid.Column>
              {/* <ArrayField
                fieldPath="titles"
                defaultNewValue={{ title: '', type: '', lang: '' }}
                label={<span><Icon disabled name="book" />Title</span>}
                renderArrayItem={DepositArrayTitlesItem} />

                <DepositResourceTypeField
                fieldPath="resource_type"
                label={<span><Icon disabled name="tag" />Resource type</span>}
                options={vocabularies.resource_type}
              /> */}
            <AccordionField fieldPath='' active={true} label={'Basic Information'} content={
              <div>
                <ArrayField
                  fieldPath="titles"
                  defaultNewValue={{ title: '', type: '', lang: '' }}
                  // <span><Icon disabled name="book" />Title</span>
                  label={'Title'} // TODO: allow <Icon>
                  renderArrayItem={ArrayTitlesItem} />

                <ResourceTypeField
                  fieldPath="resource_type"
                  // <span><Icon disabled name="tag" />Resource type</span>
                  label={'Resource type'}
                  options={vocabularies.resource_type}
                />
              </div>
            } />

              {/* header={<h3>Required Information</h3>} */}

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
