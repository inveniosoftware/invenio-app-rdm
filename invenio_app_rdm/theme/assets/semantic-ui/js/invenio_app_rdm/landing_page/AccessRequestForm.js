import _get from "lodash/get";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import * as Yup from "yup";
import { Form, Grid, Checkbox, Button, Modal } from "semantic-ui-react";
import {
  http,
  withCancel,
  ErrorMessage,
  TextField,
  TextAreaField,
  RadioField,
} from "react-invenio-forms";

export class AccessRequestForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      loading: false,
      error: undefined,
      modalOpen: false,
      retry: true,
    };
    // nullable().required() is needed to avoid ``null`` type message errors.
    this.accessRequestSchema = Yup.object({
      email: Yup.string().email().nullable().required(),
      full_name: Yup.string().nullable(),
      message: Yup.string().nullable(),
      consent_to_share_personal_data: Yup.bool().required(),
    });

    this.anonymousAccessRequestSchema = Yup.object({
      email: Yup.string().email().nullable().required(),
      full_name: Yup.string().nullable().required(),
      message: Yup.string().nullable(),
      consent_to_share_personal_data: Yup.bool().required(),
    });
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  initFormValues = () => {
    const { email, fullName } = this.props;

    return {
      email: email,
      full_name: !isEmpty(fullName) ? fullName : undefined,
      message: undefined,
      consent_to_share_personal_data: false,
    };
  };

  handleModalClose = () => {
    this.setState({ modalOpen: false });
  };

  handleSuccess = (response) => {
    const { data } = this.state;
    const { isAnonymous } = this.props;
    if (isAnonymous) {
      this.setState({ modalOpen: true });
    } else {
      window.location.replace(data.links.self_html);
    }
  };

  handleSubmit = async (values) => {
    this.setState({ loading: true });
    const { record } = this.props;
    values["consent_to_share_personal_data"] =
      values["consent_to_share_personal_data"].toString();
    const payload = { ...values };

    const postUrl = record.links.access_request;
    this.cancellableAction = withCancel(http.post(postUrl, payload));
    try {
      const response = await this.cancellableAction.promise;
      this.setState({ loading: false, data: response.data, error: undefined });
      this.handleSuccess();
    } catch (error) {
      if (error === "UNMOUNTED") return;

      const errorMessage = error?.response?.data?.message || error?.message;

      this.setState({
        error: errorMessage,
        loading: false,
      });
      console.error(error);

      // Retry the POST request if the request failed on CORS validation.
      const corsError =
        errorMessage.toLowerCase().includes("csrf") && error?.response?.status === 400;
      const { retry } = this.state;
      if (corsError && retry) {
        // Disable retries, retry should only happen once.
        this.setState({ retry: false });
        this.handleSubmit(values);
      }
    }
  };

  handleChangeConsent = ({ data, formikProps }) => {
    formikProps.form.setFieldValue("consent_to_share_personal_data", data.checked);
  };

  render() {
    const { error, loading, modalOpen } = this.state;
    const { isAnonymous } = this.props;
    const disablePersonalDataField = !isAnonymous;
    return (
      <>
        <Formik
          onSubmit={this.handleSubmit}
          enableReinitialize
          initialValues={this.initFormValues()}
          validationSchema={
            isAnonymous ? this.anonymousAccessRequestSchema : this.accessRequestSchema
          }
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, handleSubmit }) => {
            const { consent_to_share_personal_data: consent } = values;
            return (
              <>
                {error && (
                  <ErrorMessage
                    header={i18next.t("Unable to request the access.")}
                    content={i18next.t(error)}
                    icon="exclamation"
                    className="text-align-left"
                    negative
                  />
                )}

                <Form className="full-width">
                  <Grid relaxed>
                    {!disablePersonalDataField && (
                      <>
                        <Grid.Column mobile={16} tablet={8} computer={8}>
                          <Form.Field>
                            <TextField
                              required
                              fieldPath="email"
                              label="Your email address"
                              placeholder={i18next.t("Email address")}
                              icon="at"
                              iconPosition="left"
                              value={values.email}
                              type="input"
                            />
                          </Form.Field>
                        </Grid.Column>
                        <Grid.Column mobile={16} tablet={8} computer={8}>
                          <Form.Field>
                            <TextField
                              required
                              fieldPath="full_name"
                              label={i18next.t("Your full name")}
                              placeholder={i18next.t("Full name")}
                              icon="address card"
                              iconPosition="left"
                              value={values.full_name}
                              type="input"
                            />
                          </Form.Field>
                        </Grid.Column>
                      </>
                    )}
                    <Grid.Column width={16}>
                      <Form.Field>
                        <TextAreaField
                          fieldPath="message"
                          label={i18next.t("Request message")}
                          fluid
                        />
                      </Form.Field>
                    </Grid.Column>
                    <Grid.Column width={16} className="rel-pt-1">
                      <Form.Field>
                        <RadioField
                          checked={_get(values, "consent_to_share_personal_data")}
                          control={Checkbox}
                          fieldPath="consent_to_share_personal_data"
                          label={i18next.t(
                            "I agree to that my full name and email address is shared with the owners of the record"
                          )}
                          onChange={this.handleChangeConsent}
                        />
                      </Form.Field>
                    </Grid.Column>
                  </Grid>
                </Form>
                <Grid className="rel-mt-1">
                  <Grid.Column width={16} textAlign="center">
                    <Button
                      size="small"
                      labelPosition="left"
                      icon="unlock alternate"
                      primary
                      content={i18next.t("Request access")}
                      onClick={(event) => handleSubmit(event)}
                      loading={loading}
                      disabled={!consent || loading}
                    />
                  </Grid.Column>
                </Grid>
              </>
            );
          }}
        </Formik>
        <Modal open={modalOpen}>
          <Modal.Header>Email confirmation needed</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              We have sent you an email to verify your address. Please check the email
              and follow the instructions to complete the access request.
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.handleModalClose}>Close</Button>
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

AccessRequestForm.propTypes = {
  email: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  record: PropTypes.object.isRequired,
  isAnonymous: PropTypes.bool,
};

AccessRequestForm.defaultProps = {
  isAnonymous: true,
};
