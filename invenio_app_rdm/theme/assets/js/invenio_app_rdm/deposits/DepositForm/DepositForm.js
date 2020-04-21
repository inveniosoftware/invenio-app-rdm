import React, { Component } from "react";
import { Formik, Form } from "formik";
import { ErrorMessage } from "invenio-forms";
import { Button, Icon, Message, Container, Grid } from "semantic-ui-react";

import { DepositSection } from './DepositComponents';
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
    // this.record needs to be initialized with all fields
    // (at least empty) in order for formik.touched to register them.
    this.record = {version: ''};  // props.record;
    this.config = props.config || {};
    this.client = new DepositAPI(this.config);
    this.state = {
      record: this.record
    }
  }

  // TODO: Don't know what this does yet.
  // submitSerializer = (values) => {
  //   const { _submitButton, ...rawValues } = values;
  //   const newRecord = this.props.pid ? false : true;
  //   const serializedValues = this.props.submitSerializer
  //     ? this.props.submitSerializer(rawValues, newRecord)
  //     : { ...rawValues };
  //   return [serializedValues, _submitButton];
  // };

  // TODO: Mark minimum required fields - but there is no value in anything
  // more since the backend does the complicated validation
  // validate = (values) => {
  //   const errors = {};
  //   if (!values.title) {
  //     errors.title = "Required";
  //   }
  //   return errors;
  // };

  onError = (error) => {
    console.log("onError input error", error);
    let backendErrors = error.errors;
    let frontendErrors = {};
    for (const fieldError of backendErrors) {
      frontendErrors[fieldError.field] = fieldError.message;
    }
    console.log("onError output errors", frontendErrors);

    return frontendErrors;
    // TODO: Use this to display global errors
    // const errors = getIn(error, "response.data.errors", []);
    // if (isEmpty(errors)) {
    //   const message = getIn(error, "response.data.message", null);
    //   if (message) {
    //     payload = { message };
    //   } else {
    //     payload = { message: getIn(error, "message", null) };
    //   }
    // } else {
    //   const errorData = error.response.data;
    // }
  };

  onSubmit = (values, formikBag) => {
    console.log("onSubmit");
    // Formik only uses one submission exitpoint
    // We need to provide a submitter in the values to know which submission
    // endpoint to use
    const {submitter, ...record} = values;

    switch (values.submitter) {
      case "save":
        console.log("onSubmit - Save");
        this.client.save(record)
        .then(response => {
          console.log("response", response);
          // TODO: Check shape of real response like we did for errors
          this.setState({record: {...response}})
          formikBag.setSubmitting(false);
        })
        .catch(error => {
          console.log("error", error);
          const errors = this.onError(error);
          formikBag.setErrors(errors);
          formikBag.setSubmitting(false);
        });
        break;

      case "publish":
        console.log("onSubmit - Publish");
        this.client.publish(record)
        .then(response => {
          console.log("response", response);
          this.setState({ record: { ...response } })
          formikBag.setSubmitting(false);
        })
        .catch(error => {
          console.log("error", error);
          const errors = this.onError(error);
          formikBag.setErrors(errors);
          formikBag.setSubmitting(false);
        });
        break;

      default:
        console.log("onSubmit triggered some other way");
    }
  };

  onSaveClick = (event, formik) => {
    console.log("onSaveClick");
    event.preventDefault();  // TODO: investigate warnings that this raises
    formik.setFieldValue('submitter', event.target.name);  // on event loop
    // because above is on event loop, handleSubmit must also be there
    // to only execute *after*
    setTimeout(() => formik.handleSubmit(event), 0);
  }

  onPublishClick = (event, formik) => {
    console.log("onPublish called");
    event.preventDefault(); // TODO: investigate warnings that this raises
    formik.setFieldValue('submitter', event.target.name);
    setTimeout(() => formik.handleSubmit(event), 0);
  }

  onPreview = (event, formik) => {
    console.log("onPreview called");
    event.preventDefault(); // TODO: investigate warnings that this raises
  }

  render() {
    // We can't just use the record because we need to use additional fields
    // to get 2 submit buttons to work.
    // TODO: investigate "status" in Formik
    let initialValues = {
      ...this.record,
      submitter: ""
    };

    return (
      <Container style={{ marginTop: "35px" }}>
        <Formik initialValues={initialValues} onSubmit={this.onSubmit}>
          {(formik) => (
            <Form onSubmit={formik.handleSubmit}>
              <RecordPreviewer record={this.state.record} />
              <Grid columns={2}>
                <Grid.Column>
                  {/*TODO: Add global errors <ErrorMessage fieldPath="message" /> */}
                  <DepositSection header={<h3>Files</h3>}>
                  </DepositSection>

                  <DepositSection header={<h3>Identifiers</h3>}>
                  </DepositSection>

                  <DepositSection header={<h3>Required Information</h3>}>
                  </DepositSection>

                  <DepositSection header={<h3>Recommended information</h3>}>

                    {/* TODO: Might be that a component can combine these together. But it might be inflexible... */}
                    <label htmlFor="version"><Icon disabled name="code branch" />Version</label>
                    <DepositTextField name="version" />

                  </DepositSection>

                  <DepositSection header={<h3>Funding</h3>}>
                  </DepositSection>

                  <DepositSection header={<h3>Related Work</h3>}>
                  </DepositSection>

                  <DepositSection header={<h3>Geographical locations</h3>}>
                  </DepositSection>

                  {/*TODO: Implement dynamically */}
                  <DepositSection header={<h3>Dynamic Vocabulary A</h3>}>
                  </DepositSection>

                </Grid.Column>
                <Grid.Column>
                  <div>
                    <Button
                      primary
                      onClick={(e) => this.onSaveClick(e, formik)}
                      disabled={formik.isSubmitting}
                      type="submit"
                      name="save"
                      content={formik.isSubmitting && "Submitting..." || "Save draft"}
                    />
                    <Button
                      onClick={(e) => this.onPublishClick(e, formik)}
                      disabled={formik.isSubmitting}
                      type="submit"
                      name="publish"
                        content={formik.isSubmitting && "Submitting..." || "Publish"}
                    />
                    <Button
                      onClick={(e) => this.onPreview(e, formik)}
                      disabled={formik.isSubmitting}
                      type="button"
                      name="preview"
                      content="Preview"
                    />
                  </div>

                  {/*Action box
                  <div type="SharingComponent">
                    <h4>Sharing</h4>
                    <button>Share with...</button>
                    <div>share modal</div>
                    <div>
                      <p><u>Shared with</u></p>
                      <p><span>3</span>users <span>1</span> community <span>1</span> link</p>
                    </div>
                  </div>

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
                  */}
                </Grid.Column>
              </Grid>
          </Form>
          )}
        </Formik>
      </Container>
    );
  }
}
