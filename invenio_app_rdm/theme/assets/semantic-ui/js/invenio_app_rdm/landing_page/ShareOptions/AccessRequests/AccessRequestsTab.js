// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _has from "lodash/has";
import { AccessRequestExpirationSelect } from "../../../requests";
import React, { Component } from "react";
import { Modal, Divider, Grid, Form, Checkbox, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuccessIcon } from "@js/invenio_communities/members";
import {
  RadioField,
  RichInputField,
  http,
  withCancel,
  ErrorMessage,
} from "react-invenio-forms";
import * as Yup from "yup";
import _get from "lodash/get";

export class AccessRequestsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
      actionSuccess: undefined,
    };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  accessRequestSchema = Yup.object({
    allow_user_requests: Yup.bool(),
    allow_guest_requests: Yup.bool(),
    accept_conditions_text: Yup.string().nullable(),
    secret_link_expiration: Yup.string(),
  });

  handleSubmit = async (values) => {
    this.setState({ loading: true, actionSuccess: false });
    const { record, successCallback } = this.props;
    const payload = {
      allow_user_requests: values.allow_user_requests,
      allow_guest_requests: values.allow_guest_requests,
      accept_conditions_text: values.accept_conditions_text,
      secret_link_expiration: values.secret_link_expiration,
    };

    this.cancellableAction = withCancel(http.put(record.links.access, payload));

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

  initFormValues = () => {
    const { record } = this.props;

    const settings = record.parent.access.settings;

    if (!_has(settings, "secret_link_expiration")) {
      settings["secret_link_expiration"] = 0;
    }
    return { ...settings };
  };

  render() {
    const { loading, error, actionSuccess } = this.state;
    const { handleClose } = this.props;
    return (
      <Formik
        onSubmit={this.handleSubmit}
        enableReinitialize
        initialValues={this.initFormValues()}
        validationSchema={this.accessRequestSchema}
      >
        {({ values, handleSubmit }) => {
          return (
            <>
              <Modal.Content className="share-content">
                {error && (
                  <ErrorMessage
                    header={i18next.t("Unable to change the access request settings.")}
                    content={i18next.t(error)}
                    icon="exclamation"
                    className="text-align-left"
                    negative
                  />
                )}
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
                                "Allow authenticated users to request access to restricted files."
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
                                "Allow non-authenticated users to request access to restricted files."
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
                              "Enable users and guests to request access to your record's files. When access is requested " +
                                "by someone, you will get an e-mail asking for approval. After you approve a request, " +
                                "users will be granted access and guests will receive a secret link."
                            )}
                          </label>
                        </Grid.Column>
                      </Grid.Row>
                      <Grid.Row>
                        <Grid.Column>
                          <h5>{i18next.t("Accept conditions")}</h5>
                          <label className="helptext mb-0 mt-10">
                            {i18next.t(
                              "Optional. Specify conditions under which you approve access. This message will be " +
                                "visible for any user when requesting access to this record."
                            )}
                          </label>
                          <Form.Field>
                            <RichInputField fieldPath="accept_conditions_text" />
                          </Form.Field>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                    <h5>{i18next.t("Advanced options")}</h5>
                    <Divider />
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={3}>
                          <Form.Field>
                            <AccessRequestExpirationSelect
                              inline
                              value={values.secret_link_expiration}
                            />
                          </Form.Field>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Form>
                  <Grid.Row>
                    <Grid.Column>
                      <br />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Modal.Content>

              <Modal.Actions>
                {actionSuccess && (
                  <SuccessIcon
                    className="ml-10"
                    timeOutDelay={3000}
                    show={actionSuccess}
                  />
                )}
                <Button
                  size="small"
                  onClick={handleClose}
                  floated="left"
                  content={i18next.t("Cancel")}
                  icon="remove"
                />
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
              </Modal.Actions>
            </>
          );
        }}
      </Formik>
    );
  }
}

AccessRequestsTab.propTypes = {
  record: PropTypes.string.isRequired,
  successCallback: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};
