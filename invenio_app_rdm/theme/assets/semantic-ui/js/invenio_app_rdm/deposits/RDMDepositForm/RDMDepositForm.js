// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _get from "lodash/get";
import React, { Component } from "react";
import { Button, Card, Grid, Icon } from "semantic-ui-react";
import {
  AccessRightField,
  ContributorsField,
  CreatorsField,
  DatesField,
  DepositFormApp,
  DescriptionsField,
  PublishButton,
  PublicationDateField,
  PublisherField,
  ResourceTypeField,
  SaveButton,
  TitlesField,
} from "react-invenio-deposit";
import { AccordionField, ErrorMessage } from "react-invenio-forms";

import { APIErrorHandler } from "./APIErrorHandler";

export class RDMDepositForm extends Component {
  constructor(props) {
    super(props);
    this.config = props.config || {};

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

        descriptions: {
          type: [
            { text: "Abstract", value: "abstract" },
            { text: "Methods", value: "methods" },
            { text: "Series Information", value: "seriesinformation" },
            { text: "Table of Contents", value: "tableofcontents" },
            { text: "Technical Info", value: "technicalinfo" },
            { text: "Other", value: "other" },
          ],
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
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
          identifiers: {
            orcid: "0000-0001-8135-3489",
          },
        },

        contributors: {
          type: [
            { text: "Person", value: "personal" },
            { text: "Organization", value: "organizational" },
          ],
          role: [
            { text: "Editor", value: "editor" },
            { text: "Data Curator", value: "datacurator" },
            { text: "Data Manager", value: "datamanager" },
            { text: "Project Manager", value: "projectmanager" },
          ],
        },

        dates: {
          type: [
            { text: "Accepted", value: "accepted"},
            { text: "Available", value: "available"},
            { text: "Copyrighted", value: "copyrighted"},
            { text: "Collected", value: "collected"},
            { text: "Created", value: "created"},
            { text: "Issued", value: "issued"},
            { text: "Submitted", value: "submitted"},
            { text: "Updated", value: "updated"},
            { text: "Valid", value: "valid"},
            { text: "Withdrawn", value: "withdrawn"},
            { text: "Other", value: "other"}
          ],
        },
      }
    };
    this.apiErrorHandler = new APIErrorHandler(this.vocabularies);
  }

  render() {
    return (
      <DepositFormApp
        config={this.config}
        record={this.props.record}
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
                <ResourceTypeField
                  options={this.vocabularies.metadata.resource_type}
                  required
                />
                <TitlesField
                  options={this.vocabularies.metadata.titles}
                  required
                />
                <CreatorsField
                  options={this.vocabularies.metadata.creators}
                  required
                />
                <ContributorsField
                  options={this.vocabularies.metadata.contributors}
                />
                <DescriptionsField
                  options={this.vocabularies.metadata.descriptions}
                />
                <PublicationDateField required />
                <br />
              </>
            </AccordionField>

            <AccordionField
              fieldPath=""
              active={true}
              label={"Recommended Information"}
            >
              <DatesField
                options={this.vocabularies.metadata.dates}
              />
              <PublisherField />
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
