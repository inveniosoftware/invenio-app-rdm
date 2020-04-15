// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { Formik, Field, Form, ErrorMessage } from 'formik';
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Container, Grid } from "semantic-ui-react";

// Use this import interface to allow us to extract it out later
import { InvenioForm, SignupForm } from "./invenio-react-components";

// import { ReactSearchKit, InvenioSearchApi } from "react-searchkit";
// import { SearchResults } from "./SearchResults";
// import { SearchFacets } from "./SearchFacets";
// import { config } from "../config";
// const searchApi = new InvenioSearchApi(config.searchApi);

// General components
// - ArrayOfInputs
// - ExtendedDateFormatLevel0
// - Autocomplete (simple)
// - AutocompleteTagAPI
// - Dropdown
// - Textfield
// - TextAreafield
// - Toggle (boolean field)
// - Section
// - Box
// - Radiobutton
// - File uploader
// - Column/Grid system

// DepositForm-specific components:
// - DepositFormField (underlying all these components: label + input)
// - AdditionalTypedArray (used for titles and descriptions)
//   * Can be scaled back to ArrayOfInputs
// - ListContributors, NewContributors (used for creators/contributors)
//   * Can be scaled back to ArrayOfInputs
// - LicenseChooser
// - AwardFunding (2 linked autocompletes)
// - SharingComponent
// - PermissionComponent

export class DepositForm extends Component {
  render() {
    console.log("this.props.data", this.props.data);
    return (
      <Container>
        <p>Initial Data:</p>
        <pre>{JSON.stringify(this.props.data)}</pre>

        <InvenioForm>
          <div type="col"> {/* 3/4 COLUMN */}
            <div>  {/*SECTION*/}
              <h3>FILES</h3>
              <div>FILE UPLOAD</div>
            </div>

            <div> {/*SECTION*/}
              <h3>IDENTIFIERS</h3>
              <div> {/*FIELD*/}
                <label>Register DOI</label>
                <input type="toggle" />
              </div>

              <div> {/*FIELD*/}
                <span>icon</span>
                <label>Identifiers</label>
                <div type="ARRAY">
                  <input type="text" />
                </div>
              </div>
            </div>

            <div> {/*SECTION*/}
              <h3>Required information</h3>
              <div> {/*FIELD*/}
                <span>icon</span>
                <label>Resource type</label>
                <input type="text" />
              </div>

              <div> {/*FIELD*/}
                <label>Titles</label>
                <div type="AdditionalTypedArray">
                  <input type="text" />
                  <button>
                    <span>icon</span>
                    <span>text</span>
                    <span>dropdown</span>
                  </button>
                </div>
              </div>

              <div> {/*FIELD*/}
                <label>Contributors</label>
                <div type="ListContributors"></div>
                <div type="NewContributor">
                  <p>Tabbed view separated by // </p>
                  <p>or via Name type... </p>
                  <p>Person // Organization</p>
                  <div type="PersonContributor">
                    <div type="row">
                      <label>Family Name</label>
                      <input type="text" />
                      <label>Given Name</label>
                      <input type="text" />
                      <label>Name Type</label>
                      <input type="dropdown" />
                      <label>Role</label>
                      <input type="dropdown" />
                    </div>
                    <div type="row">
                      <label>Affiliation(s)</label>
                      <div type="ARRAY">
                        <input type="text" />
                      </div>
                    </div>
                    <div type="row">
                      <label>Identifier(s)</label>
                      <div type="ARRAY">
                        <input type="text" />
                      </div>
                    </div>
                  </div>

                  <div type="OrganizationContributor">
                    <div type="row">
                      <label>Organization Name</label>
                      <input type="text" />
                      <label>Role</label>
                      <input type="dropdown" />
                    </div>
                    <div type="row">
                      <label>Identifier(s)</label>
                      <div type="ARRAY">
                        <input type="text" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div> {/*FIELD*/}
                <label>Descriptions</label>
                <div type="AdditionalTypedArray">
                  <input type="text" />
                  <button>
                    <span>icon</span>
                    <span>text</span>
                    <span>dropdown</span>
                  </button>
                </div>
              </div>

              <div> {/*FIELD*/}
                <label>Publication date</label>
                <div type="ExtendedDateFormatLevel0">
                  <input type="text" />
                </div>
              </div>

              <div> {/*FIELD*/}
                <label>License</label>
                <div type="LicenseChooser">
                  <p type="license-name">Creative Commons Attribution 4.0 International (CC-BY 4.0)</p>
                  <p type="license-summary">You are free to share and adapt. so long as you provide attributions. <span><a href="">Read more</a></span></p>
                  <button>Change</button>
                </div>
              </div>

            </div>

            <div> {/*SECTION*/}
              <h3>Recommended information</h3>

              <div> {/*FIELD*/}
                <span>icon</span>
                <label>Subjects</label>
                <div type="AutocompleteTagAPI">
                  <textarea />
                </div>
              </div>

              <div> {/*FIELD*/}
                <span>icon</span>
                <label>Language</label>
                <div type="Dropdown">
                </div>
              </div>

              <div> {/*FIELD*/}
                <span>icon</span>
                <label>Dates</label>
                <div type="Array">
                  <span type="ExtendedDateFormatLevel0"></span>
                  <span type="Dropdown">Datetype</span>
                  <input type="text" />
                  <div>
                    <button>
                      <span>icon </span>
                      <span>text </span>
                    </button>
                  </div>
                </div>
              </div>

              <div> {/*FIELD*/}
                <span>icon </span>
                <label>Version</label>
                <input type="text" />
              </div>

              <div> {/*FIELD*/}
                <span>icon </span>
                <label>Publisher</label>
                <input type="text" />
              </div>

            </div>

            <div type="section"> {/*SECTION*/}
              <h3>Funding</h3>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Awards</label>
                <div type="Array">
                  <div type="AwardFunding">
                    <span type="Autocomplete"><input type="text" placeholder="Funding Organization" /></span>
                    <span type="Autocomplete"><input type="text" placeholder="Award Number" /></span>
                  </div>
                  <div>
                    <button>
                      <span>+ </span>
                      <span>Add award</span>
                    </button>
                  </div>
                </div>
              </div>

             </div>

            <div> {/*SECTION*/}
              <h3>Related Work</h3>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Related work</label>
                <div type="Array">
                  <span type="Dropdown">RelationType</span>
                  <input type="text" placeholder="Identifier (DOI, Handle)" />
                  <span type="Dropdown">ResourceType</span>
                  <div>
                    <button>
                      <span>+ </span>
                      <span>Add related identifier</span>
                    </button>
                  </div>
                </div>
              </div>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>References</label>
                <div type="Array">
                  <input type="text" placeholder="Reference string" />
                  <input type="text" placeholder="DOI, Handle, URL..." />
                  <div>
                    <button>
                      <span>+ </span>
                      <span>Add reference</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div> {/*SECTION*/}
              <h3>Geographical locations</h3>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Locations</label>
                <div type="Array">
                  <input type="text" placeholder="Latitude" />
                  <input type="text" placeholder="Longitude" />
                  <input type="text" placeholder="Place" />
                  <input type="text" placeholder="Description" />
                  <div>
                    <button>
                      <span>+ </span>
                      <span>Add location</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div> {/*SECTION*/}
              <h3>Dynamic Vocabulary A</h3>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Field 1</label>
                <input type="text" placeholder="" />
              </div>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Field 2</label>
                <div type="Array">
                  <input type="text" placeholder="An item" />
                  <div>
                    <button>
                      <span>+ </span>
                      <span>Add item</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div> {/*SECTION*/}
              <h3>Dynamic Vocabulary B</h3>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Event date</label>
                <input type="text" placeholder="" />
              </div>

              <div type="field"> {/*FIELD*/}
                <span>icon </span>
                <label>Field 2</label>
                <span type="RegularDate">
                  <input type="text" placeholder="An item" />
                </span>
              </div>

            </div>
          </div>

          <div type="col"> {/* 1/4 COLUMN */}
            {/*Action box*/}
            <div>
              <button>Publish</button>
              <button>Delete</button>
              <button>Preview</button>
              <div type="toggle">Preview</div>
            </div>

            {/*Action box*/}
            <div type="SharingComponent">
              <h4>Sharing</h4>
              <button>Share with...</button>
              <div>share modal</div>
              <div>
                <p><u>Shared with</u></p>
                <p><span>3</span>users <span>1</span> community <span>1</span> link</p>
              </div>
            </div>

            {/*Action box*/}
            <div type="PermissionComponent">
              <h4>Protection</h4>
              <div type="Radiobutton">
                <div>
                  <p>Public</p>
                  <p>details</p>
                  <div type="Checkbox">
                    <p>Private files</p>
                    <p>Apply embargo</p>
                    <p>Apply access conditions</p>
                  </div>
                </div>
                <div>
                  <p>Private</p>
                  <p>details</p>
                </div>
              </div>
            </div>

            <button>Contact support</button>

          </div>

        </InvenioForm>
        <SignupForm />

      </Container>
    );
  }
}


class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}

Greeting.propTypes = {
  name: PropTypes.string
};



/*
        <InvenioForm>
          <label htmlFor="firstName">First Name</label>
          <Field id="firstName" type="text" />
          <ErrorMessage name="firstName" />

          <label htmlFor="lastName">Last Name</label>
          <Field id="lastName" type="text" />
          <ErrorMessage name="firstName" />

          <label htmlFor="email">Email Address</label>
          <Field id="email" type="email" />
          <ErrorMessage name="firstName" />

          <button type="submit">Submit</button>
        </InvenioForm>
*/
/*
<InvenioForm
  onSubmit={this.onSubmit}
  onError={this.onError}
  formik={{
    initialValues: this.initialValues,
    validationSchema: this.MyFormSchema,
  }}
>
  <Header textAlign="center">My Form</Header>
  <TextField
    fieldPath="title"
    placeholder="Enter a new title"
    label="Title"
    fluid="true"
    required
  />
  <YearInputField fieldPath="year" label="Year" optimized />
  <Button
    primary
    disabled={isSubmitting}
    name="submit"
    type="submit"
    content="Submit"
  />
</InvenioForm>
<Message>
  <Message.Header>Submitted record</Message.Header>
  <pre>{JSON.stringify(this.state.record, null, 2)}</pre>
</Message>
*/

// <ReactSearchKit searchApi={searchApi} eventListenerEnabled={true}>
//   <Container>
//     <Grid relaxed style={{ padding: "2em 0" }}>
//       <Grid.Row columns={2}>
//         <Grid.Column width={4} className="search-aggregations">
//           <SearchFacets />
//         </Grid.Column>
//         <Grid.Column width={12}>
//           <SearchResults />
//         </Grid.Column>
//       </Grid.Row>
//     </Grid>
//   </Container>
// </ReactSearchKit>
