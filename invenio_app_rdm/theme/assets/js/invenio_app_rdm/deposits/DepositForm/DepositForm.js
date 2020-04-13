import React, { Component } from "react";
import { getIn } from "formik";
import isEmpty from "lodash/isEmpty";
import { Header, Message, Container } from "semantic-ui-react";
import { TextField, InvenioForm, ErrorMessage } from "invenio-forms";

import { http } from "../http";

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
    this.state = {
      record: this.record,
    };
  }

  submitSerializer = (values) => {
    const { _submitButton, ...rawValues } = values;
    const newRecord = this.props.pid ? false : true;
    const serializedValues = this.props.submitSerializer
      ? this.props.submitSerializer(rawValues, newRecord)
      : { ...rawValues };
    return [serializedValues, _submitButton];
  };

  validate = (values) => {
    const errors = {};

    if (!values.title) {
      errors.title = "Required";
    }
    return errors;
  };

  onSubmit = (values) => {
    this.setState({ record: values });
    console.log(values);
    return http.post(this.config.apiUrl, values);
  };

  onError = (error) => {
    console.log(error);

    let payload = {};
    const errors = getIn(error, "response.data.errors", []);

    if (isEmpty(errors)) {
      const message = getIn(error, "response.data.message", null);
      if (message) {
        payload = { message };
      } else {
        payload = { message: getIn(error, "message", null) };
      }
    } else {
      const errorData = error.response.data;
      for (const fieldError of errorData.errors) {
        payload[fieldError.field] = fieldError.message;
      }
    }
    console.log(payload);

    return payload;
  };

  render() {
    return (
      <Container style={{ marginTop: "35px" }}>
        <InvenioForm
          onSubmit={this.onSubmit}
          onError={this.onError}
          formik={{  // TODO: Encapsulate away so not visible in interface
            initialValues: this.record,
          }}
        >
          <ErrorMessage fieldPath="message" />
          <TextField
            fieldPath="contact"
            placeholder="Enter a new contact"
            label="Contact"
            fluid="true"
            required
          />
        </InvenioForm>
        <RecordPreviewer record={this.state.record} />
      </Container>
    );
  }
}
          // <Header textAlign="center">My Form</Header>
