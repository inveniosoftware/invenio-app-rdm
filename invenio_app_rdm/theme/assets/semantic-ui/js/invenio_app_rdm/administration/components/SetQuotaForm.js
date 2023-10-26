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
import { Formik } from "formik";
import {
  withCancel,
  ErrorMessage,
  TextField,
  TextAreaField,
  http,
} from "react-invenio-forms";
import { Form, Button, Modal } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import * as Yup from "yup";

export class SetQuotaForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
    this.tombstoneSchema = Yup.object({
      quota_size: Yup.number().required().min(1),
      max_file_size: Yup.number().required().min(1),
      notes: Yup.string(),
    });
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  handleSubmit = async (values) => {
    this.setState({ loading: true });
    const { addNotification } = this.context;
    const { resource, actionSuccessCallback, apiUrl } = this.props;
    const payload = { ...values };
    this.cancellableAction = withCancel(http.post(apiUrl, payload));
    try {
      await this.cancellableAction.promise;
      this.setState({ loading: false, error: undefined });
      addNotification({
        title: i18next.t("Success"),
        content: i18next.t("Quota of {{id}} was set to {{quota}}", {
          id: resource.id,
          quota: payload.quota_size,
        }),
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
    // TODO take current quota
    return {
      quota_size: undefined,
      max_file_size: undefined,
      notes: undefined,
    };
  };

  render() {
    const { error, loading } = this.state;
    return (
      <Formik
        onSubmit={this.handleSubmit}
        enableReinitialize
        initialValues={this.initFormValues()}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={this.tombstoneSchema}
      >
        {({ values, handleSubmit }) => {
          return (
            <>
              {error && (
                <ErrorMessage
                  header={i18next.t("Unable to set quota.")}
                  content={i18next.t(error)}
                  icon="exclamation"
                  className="text-align-left"
                  negative
                />
              )}
              <Modal.Content>
                <Form className="full-width">
                  <Form.Field>
                    <TextField
                      required
                      fieldPath="quota_size"
                      label={i18next.t("Quota size")}
                      placeholder={i18next.t("Enter quota size...")}
                      type="number"
                    />
                    <TextField
                      required
                      fieldPath="max_file_size"
                      label={i18next.t("Max file size")}
                      placeholder={i18next.t("Enter max file size...")}
                      type="number"
                    />
                  </Form.Field>
                  <Form.Field>
                    <TextAreaField fieldPath="notes" label={i18next.t("Note")} fluid />
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
                  content={i18next.t("Set quota")}
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

SetQuotaForm.propTypes = {
  resource: PropTypes.object.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
  apiUrl: PropTypes.string.isRequired,
};
