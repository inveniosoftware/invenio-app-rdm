/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Trans } from "react-i18next";
import { Formik } from "formik";
import _get from "lodash/get";

import { withCancel, ErrorMessage, RadioField, ErrorLabel } from "react-invenio-forms";
import { Form, Button, Modal, Message, Icon, Checkbox } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import * as Yup from "yup";
import { UserModerationApi } from "../users/api";

export class ImpersonateUserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
    this.confirmSchema = Yup.object({
      acceptToLogout: Yup.bool().oneOf([true], i18next.t("You must accept this.")),
      acceptImpersonation: Yup.bool().oneOf([true], i18next.t("You must accept this.")),
    });
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  handleSubmit = async (values) => {
    this.setState({ loading: true });
    const { addNotification } = this.context;
    const { user, actionSuccessCallback } = this.props;
    this.cancellableAction = withCancel(UserModerationApi.impersonateUser(user));
    try {
      await this.cancellableAction.promise;
      this.setState({ loading: false, error: undefined });
      addNotification({
        title: i18next.t("Success"),
        content: i18next.t(
          "User impersonated succesfully! You will be redirected in frontpage soon.",
          {
            id: user.id,
          }
        ),
        type: "success",
      });
      actionSuccessCallback();
    } catch (error) {
      if (error === "UNMOUNTED") return;

      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
      console.error(error);
    }
  };

  handleModalClose = () => {
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  initFormValues = () => {
    return {
      acceptToLogout: false,
      acceptImpersonation: false,
    };
  };

  render() {
    const { error, loading } = this.state;
    const { user } = this.props;
    console.log({ user });
    return (
      <Formik
        onSubmit={this.handleSubmit}
        enableReinitialize
        initialValues={this.initFormValues()}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={() => this.confirmSchema}
      >
        {({ values, handleSubmit }) => {
          return (
            <>
              {error && (
                <ErrorMessage
                  header={i18next.t("Unable to impersonate user.")}
                  content={i18next.t(error)}
                  icon="exclamation"
                  className="text-align-left"
                  negative
                />
              )}

              <Modal.Content>
                <Message visible error>
                  <p>
                    <Icon name="warning sign" />
                    {i18next.t(
                      "Please read carefully and confirm the following statements before you proceed."
                    )}
                  </p>
                </Message>
                <Form>
                  <Form.Field id="accept-impersonation-checkbox">
                    <RadioField
                      control={Checkbox}
                      fieldPath="acceptImpersonation"
                      label={
                        <Trans
                          defaults={i18next.t(
                            "You are about to impersonate user <bold>{{email}}(id: {{id}})</bold>.",
                            { email: user.email, id: user.id }
                          )}
                          values={{ email: user.email, id: user.id }}
                          components={{ bold: <b /> }}
                          shouldUnescape
                        />
                      }
                      checked={_get(values, "acceptImpersonation") === true}
                      onChange={({ data, formikProps }) => {
                        formikProps.form.setFieldValue(
                          "acceptImpersonation",
                          data.checked
                        );
                      }}
                      optimized
                    />

                    <ErrorLabel
                      role="alert"
                      fieldPath="acceptImpersonation"
                      className="mt-0 mb-5"
                    />
                  </Form.Field>
                  <Form.Field id="accept-logout-checkbox">
                    <RadioField
                      control={Checkbox}
                      fieldPath="acceptToLogout"
                      label={
                        <Trans
                          defaults={i18next.t(
                            "You <bold>MUST</bold> logout after completing your inquiry."
                          )}
                          components={{ bold: <b /> }}
                          shouldUnescape
                        />
                      }
                      checked={_get(values, "acceptToLogout") === true}
                      onChange={({ data, formikProps }) => {
                        formikProps.form.setFieldValue("acceptToLogout", data.checked);
                      }}
                      optimized
                    />
                    <ErrorLabel
                      role="alert"
                      fieldPath="acceptToLogout"
                      className="mt-0 mb-5"
                    />
                  </Form.Field>
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.handleModalClose} floated="left">
                  Close
                </Button>
                <Button
                  size="small"
                  labelPosition="left"
                  icon="check"
                  color="green"
                  content={i18next.t("Impersonate")}
                  onClick={(event) => handleSubmit(event)}
                  loading={loading}
                  disabled={loading}
                />
              </Modal.Actions>
            </>
          );
        }}
      </Formik>
    );
  }
}

ImpersonateUserForm.propTypes = {
  user: PropTypes.object.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
};
