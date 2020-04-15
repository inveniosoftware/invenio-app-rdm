// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { Formik, Field, Form, ErrorMessage } from 'formik';
import React, { Component } from "react";
import { Container, Grid } from "semantic-ui-react";

// Use this import interface to allow us to extract it out later
import { InvenioForm, SignupForm } from "./invenio-react-components";

// import { ReactSearchKit, InvenioSearchApi } from "react-searchkit";
// import { SearchResults } from "./SearchResults";
// import { SearchFacets } from "./SearchFacets";
// import { config } from "../config";
// const searchApi = new InvenioSearchApi(config.searchApi);


export class DepositMain extends Component {
  render() {
    console.log("this.props.data", this.props.data);
    return (
      <Container>
        <p>Initial Data:</p>
        <pre>{JSON.stringify(this.props.data)}</pre>

        <SignupForm />

      </Container>
    );
  }
}
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
