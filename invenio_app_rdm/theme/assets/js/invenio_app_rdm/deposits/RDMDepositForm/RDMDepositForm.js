// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Message, Grid } from "semantic-ui-react";
import { Field } from "formik";

import { RDMDepositApiClient } from "./RDMDepositAPIClient";
import { RDMDepositController } from "./RDMDepositController";
import {
  DepositFormApp,
  PublishButton,
  SaveButton,
  connect,
  CreatorsField,
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


export class FormRecordPreviewer extends Component {
  renderFormField = (formikBag) => {
    const values = formikBag.form.values;
    return (
      <Message>
        <Message.Header>Current Form record</Message.Header>
        <pre>{JSON.stringify(values, undefined, 2)}</pre>
      </Message>
    );
  };

  render() {
    return (
      <Field
        name="FormRecordPreviewer"
        component={this.renderFormField}
      />
    );
  }
}

function fakeInitialRecord(backendRecord) {
  /** Returns the initialRecord with experimental changes.
   * Used to group trial changes.
   */
  // Experiment: no creators defined. Our default functionality will take the slack.
  const { creators, ...fakedRecord } = backendRecord;
  // console.log("fakedRecord", JSON.stringify(fakedRecord, null, 2))
  return fakedRecord;
}

// NOTE: RDMDepositForm knows the data model. No other way for it to interact
//       with it. As the frontend, it needs to duplicate the knowledge, mimicking
//       what other frontends would need to do.
const defaultRecord = {
  creators: [
    {
      affiliations: [
        {
          identifier: "",
          name: "",
          scheme: "",
        }
      ],
      given_name: "",
      family_name: "",
      name: "",
      type: "personal",
      identifiers: [
        {
          identifier: "",
          scheme: "",
        }
      ]
    }
  ]
}

// NOTE: RDMDepositForm knows the meaning associated to the field.
// i.e. it knows its datamodel is the one sent by invenio-rdm-records.
// However, it is RDMDepositForm that gets to decide what are the frontend
// defaults for this datamodel
function defaultize(initialRecord) {
  return {
    ...defaultRecord,
    ...initialRecord,
  };
}

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    this.controller = new RDMDepositController(new RDMDepositApiClient());
    console.log("backend initial record", JSON.stringify(props.record, null, 2))
    console.log("faked backend record", JSON.stringify(fakeInitialRecord(props.record), null, 2))
    const record = defaultize(fakeInitialRecord(props.record));
    console.log("initial form record", JSON.stringify(record, null, 2))
    this.state = {
      record: record || {},
    };
  }

  render() {
    // GRADUAL: placing all the dynamically provided backend data
    //          (vocabularies) here
    //          so that iteration is faster and abstractions can be discovered.
    //          Then will let backend generate them (if appropriate).
    // const vocabularies = this.config.vocabularies || {
    const vocabularies = {
      ...this.config.vocabularies,
      // **Vocabulary experiments go here**
      creators: {
        type: [{ text: "Person", value: "personal"}, { text: "Organization", value: "organizational" }]
      }
    };

    // columns = {2}
    return (
      <DepositFormApp
        config={this.config}
        controller={this.controller}
        record={this.state.record}
      >
        <ErrorMessage fieldPath="message" />
        <Grid>
          <Grid.Column width={12}>
            <AccordionField
              fieldPath=""
              active={true}
              label={"Basic Information"}
            >
              <div>
                <TitlesField fieldPath="titles" label="Titles" labelIcon="book" />
                <CreatorsField
                  fieldPath="creators"
                  label="Creators" labelIcon="group"
                  options={vocabularies.creators}
                  typeSegment={"type"}
                  familyNameSegment={"family_name"}
                  givenNameSegment={"given_name"}
                  nameSegment={"name"}
                  identifiersSegment={"identifiers"}
                  identifiersSchemeSegment={"scheme"}
                  identifiersIdentifierSegment={"identifier"}
                  affiliationsSegment={"affiliations"}
                  affiliationsNameSegment={"name"}
                  affiliationsIdentifierSegment={"identifier"}
                  affiliationsSchemeSegment={"scheme"}
                />

                {/* <ContributorsField fieldPath="contributors" label="Creators" label_icon="group" /> */}
                <ResourceTypeField
                  fieldPath="resource_type"
                  label={"Resource type"}
                  labelIcon={"tag"}
                  options={vocabularies.resource_type}
                />
              </div>
            </AccordionField>
          </Grid.Column>

          <Grid.Column width={4}>
            <SaveButton />
            <PublishButton />
          </Grid.Column>
        </Grid>

        <FormRecordPreviewer />
        <RecordPreviewer />
      </DepositFormApp>
    );
  }
}
