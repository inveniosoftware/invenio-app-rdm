// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Button, Card, Grid, Icon } from "semantic-ui-react";
import { Field } from "formik";
import {
  AccessRightField,
  DepositFormApp,
  PublishButton,
  SaveButton,
  ContributorsField,
  CreatorsField,
  TitlesField,
  ResourceTypeField,
} from "react-invenio-deposit";
import { AccordionField, ErrorMessage } from "react-invenio-forms";

import { APIErrorHandler } from "./APIErrorHandler";

function fakeInitialRecord(backendRecord) {
  /** Returns the initialRecord with experimental changes.
   * Used to group trial changes.
   */
  // Experiment: Ignore backend for now and gradually fill what the frontend
  //             needs for a brand new record
  const { creators, contributors, titles, ...fakedRecord } = backendRecord;
  return { metadata: fakedRecord };
}

// NOTE: RDMDepositForm knows the data model. No other way for it to interact
//       with it. As the frontend, it needs to duplicate the knowledge, mimicking
//       what other frontends would need to do.
const defaultRecord = {
  access: {
    metadata_restricted: false,
    files_restricted: false,
    owners: [1],
    created_by: 1,
  },
  metadata: {
    titles: [
      {
        lang: "",
        title: "",
        type: "MainTitle",
      },
    ],
    creators: [
      {
        affiliations: [
          {
            identifier: "",
            name: "",
            scheme: "",
          },
        ],
        given_name: "",
        family_name: "",
        name: "",
        type: "Personal",
        identifiers: [
          {
            identifier: "",
            scheme: "",
          },
        ],
      },
    ],
    contributors: [
      {
        affiliations: [
          {
            identifier: "",
            name: "",
            scheme: "",
          },
        ],
        given_name: "",
        family_name: "",
        name: "",
        type: "Personal",
        identifiers: [
          {
            identifier: "",
            scheme: "",
          },
        ],
        role: "",
      },
    ],
  },
};

// NOTE: RDMDepositForm knows the meaning associated to the field.
// i.e. it knows its datamodel is the one sent by invenio-rdm-records.
// However, it is RDMDepositForm that gets to decide what are the frontend
// defaults for this datamodel
function defaultize(initialRecord) {
  let record = { ...defaultRecord };
  record.metadata = { ...record.metadata, ...initialRecord.metadata };
  return record;
}

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};
    const record = defaultize(fakeInitialRecord(props.record));
    this.state = {
      record: record || {},
    };

    // TODO: Make ALL vocabulary be generated by backend.
    // Currently, some vocabulary is generated by backend and some is
    // generated by frontend here. Iteration is faster and abstractions can be
    // discovered by generating vocabulary here. Once happy with vocabularies,
    // then we can generate it in the backend.
    this.vocabularies = {
      access: {
        access_right: this.config.vocabularies.access_right,
      },
      metadata: {
        ...this.config.vocabularies,

        titles: {
          ...this.config.vocabularies.titles,
          lang: [
            { text: "Danish", value: "dan" },
            { text: "English", value: "eng" },
            { text: "French", value: "fra" },
            { text: "German", value: "deu" },
            { text: "Greek", value: "ell" },
            { text: "Italian", value: "ita" },
            { text: "Spanish", value: "spa" },
          ],
        },

        creators: {
          type: [
            { text: "Person", value: "Personal" },
            { text: "Organization", value: "Organizational" },
          ],
        },

        contributors: {
          type: [
            { text: "Person", value: "Personal" },
            { text: "Organization", value: "Organizational" },
          ],
          role: [
            { text: "Editor", value: "Editor" },
            { text: "DataCurator", value: "DataCurator" },
            { text: "DataManager", value: "DataManager" },
            { text: "ProjectManager", value: "ProjectManager" },
          ],
        },
      },
    };
    this.apiErrorHandler = new APIErrorHandler(this.vocabularies);
  }

  render() {
    return (
      <DepositFormApp
        config={this.config}
        record={this.state.record}
        apiErrorHandler={this.apiErrorHandler}
      >
        <ErrorMessage fieldPath="message" />
        <Grid>
          <Grid.Column width={12}>
            <AccordionField fieldPath="" active={true} label={"Files"}>
              <p>COMING SOON</p>
              <br />
            </AccordionField>

            <AccordionField fieldPath="" active={true} label={"Identifiers"}>
              <p>COMING SOON</p>
              <br />
            </AccordionField>

            <AccordionField
              fieldPath=""
              active={true}
              label={"Basic Information"}
            >
              <>
                <TitlesField
                  fieldPath="metadata.titles"
                  label="Titles"
                  labelIcon="book"
                  options={this.vocabularies.metadata.titles}
                  required
                />
                <CreatorsField
                  fieldPath="metadata.creators"
                  label="Creators"
                  labelIcon="group"
                  options={this.vocabularies.metadata.creators}
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
                <ContributorsField
                  fieldPath="metadata.contributors"
                  label="Contributors"
                  labelIcon="group"
                  options={this.vocabularies.metadata.contributors}
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
                  roleSegment={"role"}
                />
                <ResourceTypeField
                  fieldPath="metadata.resource_type"
                  label={"Resource type"}
                  labelIcon={"tag"}
                  options={this.vocabularies.metadata.resource_type}
                />
              </>
            </AccordionField>

            <AccordionField
              fieldPath=""
              active={true}
              label={"Recommended Information"}
            >
              <p>COMING SOON</p>
              <br />
            </AccordionField>
          </Grid.Column>

          <Grid.Column width={4}>
            <Card className="actions">
              <Card.Content>
                <SaveButton fluid className="save-button" />
                <PublishButton fluid />
              </Card.Content>
            </Card>
            <AccessRightField
              fieldPath="access.access_right"
              label={"Protection"}
              labelIcon={"shield"}
              options={this.vocabularies.access.access_right}
            />
            <Grid.Row centered>
              <Button className="disabled contact-support">
                <Icon name="mail outline" />
                Contact Support
              </Button>
            </Grid.Row>
          </Grid.Column>
        </Grid>
      </DepositFormApp>
    );
  }
}
