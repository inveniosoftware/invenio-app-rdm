import React, { Component } from "react";
import { getIn, Formik, Form } from "formik";
import isEmpty from "lodash/isEmpty";
import { TextField, InvenioForm, ErrorMessage } from "invenio-forms";
import { Button, Header, Message, Container, Rail, Grid } from "semantic-ui-react";

import { DepositSection } from './DepositComponents';
import { DepositUpload } from './DepositComponents';
import { DepositTextField } from './DepositComponents';

import {DepositAPI} from './DepositAPI';


const CurrentRecord = (props) => (
  <Message>
    <Message.Header>Submitted record</Message.Header>
    <pre>{JSON.stringify(props.record, undefined, 2)}</pre>
  </Message>
);

class RecordPreviewer extends Component {
  constructor(props) {
    super(props);
    this.el = document.getElementById("previewer");
  }

  render() {
    return <CurrentRecord record={this.props.record} />;
  }
}

export class DepositForm extends Component {
  constructor(props) {
    super(props);
    this.record = props.record || {};
    this.config = props.config || {};
    this.client = new DepositAPI(this.config);
  }

  // submitSerializer = (values) => {
  //   const { _submitButton, ...rawValues } = values;
  //   const newRecord = this.props.pid ? false : true;
  //   const serializedValues = this.props.submitSerializer
  //     ? this.props.submitSerializer(rawValues, newRecord)
  //     : { ...rawValues };
  //   return [serializedValues, _submitButton];
  // };

  // validate = (values) => {
  //   const errors = {};

  //   if (!values.title) {
  //     errors.title = "Required";
  //   }
  //   return errors;
  // };

  onSubmit = (values, formikBag) => {
    console.log("onSubmit");
    console.log("values.submitter", values.submitter);
    // Formik uses 1 submission exitpoint
    // We need to provide a submitter in the values to know which submission
    // to make;
    switch (values.submitter) {
      case "save":
        console.log("onSubmit triggered from save");
        const {submitter, ...record} = values;
        this.client.save(record)
        .then(response => {
          console.log("response", response);
          formikBag.setSubmitting(false);
        })
        .except(error => {
          console.log("error", error);
          formikBag.setSubmitting(false);
        });
        break;
      default:
        console.log("onSubmit triggered some other way");
    }
  };

  onSave = (event, formik) => {
    console.log("onSave called");
    event.preventDefault(); // raises warning I am not familiar with
    formik.setFieldValue('submitter', event.target.name);
    setTimeout(() => formik.handleSubmit(event), 0);
  }

  // onError = (error) => {
  //   console.log(error);

  //   let payload = {};
  //   const errors = getIn(error, "response.data.errors", []);

  //   if (isEmpty(errors)) {
  //     const message = getIn(error, "response.data.message", null);
  //     if (message) {
  //       payload = { message };
  //     } else {
  //       payload = { message: getIn(error, "message", null) };
  //     }
  //   } else {
  //     const errorData = error.response.data;
  //     for (const fieldError of errorData.errors) {
  //       payload[fieldError.field] = fieldError.message;
  //     }
  //   }
  //   console.log(payload);

  //   return payload;
  // };

  render() {
    // We can't just use the record because we need to use initialValues
    // to get 2 submit buttons to work.
    let initialValues = {
      ...this.record,
      submitter: ""
    };

    return (
      <Container style={{ marginTop: "35px" }}>
        <Formik initialValues={initialValues} onSubmit={this.onSubmit}>
          {(formik) => (
          <Form onSubmit={formik.handleSubmit}>
            <Grid columns={2}>
              <Grid.Column>
                <ErrorMessage fieldPath="message" />

                <DepositSection header={<h3>Recommended information</h3>}>

                  <DepositTextField icon="building" label="Publisher" />

                </DepositSection>

              </Grid.Column>
              <Grid.Column>
                <Button
                  primary
                  onClick={(e) => this.onSave(e, formik)}
                  disabled={formik.isSubmitting}
                  type="submit"
                  name="save"
                  content="Save"
                />
              </Grid.Column>
            </Grid>
          </Form>
          )}
        </Formik>
      </Container>
    );
  }
}
      // <Header textAlign="center">My Form</Header>
      // <Container style={{ marginTop: "35px" }}>
      //   <p>HELLLO</p>
      //   <InvenioForm
      //     onSubmit={this.onSubmit}
      //     onError={this.onError}
      //     formik={{  // TODO: Encapsulate away so not visible in interface
      //       initialValues: this.record,
      //     }}
      //   >
      //     <p>isSubmitting: {isSubmitting}</p>
      //     <ErrorMessage fieldPath="message" />
      //     <TextField
      //       fieldPath="contact"
      //       placeholder="Enter a new contact"
      //       label="Contact"
      //       fluid="true"
      //       required
      //     />
      //   </InvenioForm>
      //   <RecordPreviewer record={this.state.record} />
      // </Container>
