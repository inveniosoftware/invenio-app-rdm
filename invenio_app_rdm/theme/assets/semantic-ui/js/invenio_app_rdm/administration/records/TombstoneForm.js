/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * // Copyright (C) 2024 KTH Royal Institute of Technology.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import RemovalReasonsSelect from "./RemovalReasonsSelect";
import { RecordModerationApi } from "../records/api";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Formik } from "formik";
import {
  withCancel,
  ErrorMessage,
  TextField,
  TextAreaField,
} from "react-invenio-forms";
import { Form, Button, Modal, Divider, Message, Icon } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import * as Yup from "yup";

export default class TombstoneForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
    this.tombstoneSchema = Yup.object({
      removal_reason: Yup.string().required(),
      note: Yup.string(),
      citation_text: Yup.string(),
      is_visible: Yup.bool().required(),
    });
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  handleSubmit = async (values) => {
    const { addNotification } = this.context;
    const { resource, actionSuccessCallback } = this.props;
    const payload = { ...values };

    this.setState({ loading: true });

    this.cancellableAction = withCancel(
      RecordModerationApi.deleteRecord(resource, payload)
    );

    try {
      await this.cancellableAction.promise;
      this.setState({ loading: false, error: undefined });
      addNotification({
        title: i18next.t("Success"),
        content: i18next.t("Record {{id}} was deleted.", { id: resource.id }),
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
      removal_reason: undefined,
      note: undefined,
      citation_text: undefined,
      is_visible: true,
    };
  };

  handleVisibility = (setFieldValue, value) => {
    setFieldValue("is_visible", value);
  };

  render() {
    const { error, loading } = this.state;
    const { resource } = this.props;
    const isPublic = resource.access.record === "public";
    return (
      <Formik
        onSubmit={this.handleSubmit}
        enableReinitialize
        initialValues={this.initFormValues()}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={this.tombstoneSchema}
      >
        {({ values, handleSubmit, setFieldValue }) => {
          return (
            <>
              {error && (
                <ErrorMessage
                  header={i18next.t("Unable to delete")}
                  content={error}
                  icon="exclamation"
                  className="text-align-left"
                  negative
                />
              )}
              <Modal.Content>
                <Form className="full-width">
                  <Button.Group widths={2} fluid>
                    <Button
                      color={values.is_visible ? "green" : ""}
                      active={values.is_visible}
                      // }
                      value
                      onClick={(event, elem) =>
                        this.handleVisibility(setFieldValue, true)
                      }
                    >
                      {i18next.t("Public")}
                    </Button>
                    <Button
                      active={!values.is_visible}
                      color={!values.is_visible ? "red" : ""}
                      value={false}
                      onClick={(event, elem) =>
                        this.handleVisibility(setFieldValue, false)
                      }
                    >
                      {i18next.t("Hidden")}
                    </Button>
                  </Button.Group>
                  {!values.is_visible && isPublic && (
                    <Message icon warning className="display">
                      <Icon name="warning sign" />
                      {i18next.t(
                        "The tombstone is set to hidden but your record is public. Best practice is to provide a public tombstone when deactivating public records."
                      )}
                    </Message>
                  )}
                  {values.is_visible && !isPublic && (
                    <Message icon negative className="display">
                      <Icon name="warning sign" />
                      {i18next.t(
                        "RISK INFORMATION LEAKAGE: The tombstone is set to public but your record is restricted. Please make sure no restricted information is shared in the tombstone below."
                      )}
                    </Message>
                  )}
                  <Divider hidden />
                  <Form.Field>
                    <RemovalReasonsSelect setFieldValue={setFieldValue} />
                  </Form.Field>
                  <Form.Field>
                    <TextField
                      fieldPath="citation_text"
                      label={i18next.t("Bibliographic citation")}
                      placeholder={i18next.t(
                        "Input citation text. Blank field will be filled with APA citation by default."
                      )}
                    />
                  </Form.Field>
                  <Form.Field>
                    <TextAreaField
                      fieldPath="note"
                      label={i18next.t("Public note")}
                      fluid
                    />
                  </Form.Field>
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.handleModalClose} floated="left">
                  {i18next.t("Close")}
                </Button>
                <Button
                  size="small"
                  labelPosition="left"
                  basic
                  icon="trash alternate"
                  color="red"
                  content={i18next.t("Delete record")}
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

TombstoneForm.propTypes = {
  resource: PropTypes.object.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
};
