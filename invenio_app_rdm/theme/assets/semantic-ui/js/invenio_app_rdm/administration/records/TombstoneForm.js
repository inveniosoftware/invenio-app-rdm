/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
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
import { Form, Button, Modal, Divider } from "semantic-ui-react";
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
      note: Yup.string().required(),
      citation_text: Yup.string().required(),
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
        title: "Success",
        content: `Record ${resource.id} was deleted.`,
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
    const { resource } = this.props; // TODO take citation
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
                  header={i18next.t("Unable to delete.")}
                  content={i18next.t(error)}
                  icon="exclamation"
                  className="text-align-left"
                  negative
                />
              )}
              <Modal.Content>
                <Form className="full-width">
                  <Button.Group widths={3} fluid>
                    <Button
                      color={values.is_visible ? "green" : ""}
                      active={values.is_visible}
                      // }
                      value
                      onClick={(event, elem) =>
                        this.handleVisibility(setFieldValue, true)
                      }
                    >
                      Public
                    </Button>
                    <Button
                      active={!values.is_visible}
                      color={!values.is_visible ? "red" : ""}
                      value={false}
                      onClick={(event, elem) =>
                        this.handleVisibility(setFieldValue, false)
                      }
                    >
                      Hidden
                    </Button>
                  </Button.Group>
                  <Divider hidden />
                  <Form.Field>
                    <RemovalReasonsSelect setFieldValue={setFieldValue} />
                  </Form.Field>
                  <Form.Field>
                    <TextField
                      required
                      fieldPath="citation_text"
                      label="Bibliographic citation"
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
                  Close
                </Button>
                <Button
                  size="small"
                  labelPosition="left"
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
