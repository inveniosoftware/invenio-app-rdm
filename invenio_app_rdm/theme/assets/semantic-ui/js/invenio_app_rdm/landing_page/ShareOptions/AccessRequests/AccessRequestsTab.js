// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Modal, Message, Grid, Form, Checkbox, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuccessIcon } from "@js/invenio_communities/members";
import { RadioField, TextAreaField, http, withCancel } from "react-invenio-forms";
import * as Yup from "yup";
import _get from "lodash/get";

export class AccessRequestsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  accessRequestSchema = Yup.object({
    allow_user_requests: Yup.bool(),
    allow_guest_requests: Yup.bool(),
    accept_conditions_text: Yup.string().nullable(),
  });

  handleSubmit = async (values) => {
    this.setState({ loading: true, actionSuccess: false });
    const { record, successCallback } = this.props;
    const payload = {
      allow_user_requests: values.allow_user_requests,
      allow_guest_requests: values.allow_guest_requests,
      accept_conditions_text: values.accept_conditions_text,
    };

    this.cancellableAction = withCancel(
      http.put(record.links.self + "/access", payload)
    );

    try {
      const response = await this.cancellableAction.promise;
      this.setState({ loading: false, actionSuccess: true, error: undefined });
      successCallback(response.data);
    } catch (error) {
      if (error === "UNMOUNTED") return;

      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
        actionSuccess: false,
      });
      console.error(error);
    }
  };

  render() {
    const { record } = this.props;
    const { loading, error, actionSuccess } = this.state;
    return (
      <Modal.Content>
        {error && (
          <Message className="mb-30" negative>
            {error}
          </Message>
        )}
        <Formik
          onSubmit={this.handleSubmit}
          enableReinitialize
          initialValues={{
            allow_user_requests: record.parent.access.settings.allow_user_requests,
            allow_guest_requests: record.parent.access.settings.allow_guest_requests,
            accept_conditions_text:
              record.parent.access.settings.accept_conditions_text,
          }}
          validationSchema={this.accessRequestSchema}
        >
          {({ values, handleSubmit }) => {
            return (
              <Grid>
                <Form>
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <Form.Field>
                          <RadioField
                            checked={_get(values, "allow_user_requests")}
                            control={Checkbox}
                            fieldPath="allow_user_requests"
                            label={i18next.t(
                              "Allow authenticated users to request access to restricted records/files."
                            )}
                            onChange={({ data, formikProps }) => {
                              formikProps.form.setFieldValue(
                                "allow_user_requests",
                                data.checked
                              );
                            }}
                          />
                        </Form.Field>
                        <Form.Field>
                          <RadioField
                            checked={_get(values, "allow_guest_requests")}
                            control={Checkbox}
                            fieldPath="allow_guest_requests"
                            label={i18next.t(
                              "Allow non-authenticated users to request access to restricted records/files."
                            )}
                            onChange={({ data, formikProps }) => {
                              formikProps.form.setFieldValue(
                                "allow_guest_requests",
                                data.checked
                              );
                            }}
                          />
                        </Form.Field>
                        <label className="helptext mb-0 mt-10">
                          {i18next.t(
                            "Enable users and guests to request access to your record. You will get an email " +
                              "asking for approval. After you approve a request, users will be granted access and " +
                              "guests will receive a secret link."
                          )}
                        </label>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column>
                        <Form.Field>
                          <TextAreaField
                            placeholder={i18next.t(
                              "Optional. Specify conditions under which you approve access."
                            )}
                            fieldPath="accept_conditions_text"
                            rows={6}
                          />
                        </Form.Field>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Form>
                <Grid.Row>
                  <Grid.Column>
                    <Button
                      size="small"
                      labelPosition="left"
                      icon="checkmark"
                      primary
                      content={i18next.t("Save")}
                      onClick={(event) => handleSubmit(event)}
                      loading={loading}
                      disabled={loading}
                    />
                    {actionSuccess && (
                      <SuccessIcon
                        className="ml-10"
                        timeOutDelay={3000}
                        show={actionSuccess}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            );
          }}
        </Formik>
      </Modal.Content>
    );
  }
}

AccessRequestsTab.propTypes = {
  record: PropTypes.string.isRequired,
  successCallback: PropTypes.func.isRequired,
};
