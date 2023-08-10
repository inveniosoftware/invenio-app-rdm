// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Grid, Form, Button, Message } from "semantic-ui-react";
import { Formik } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuccessIcon } from "@js/invenio_communities/members";
import { TextField, http, withCancel } from "react-invenio-forms";
import * as Yup from "yup";

export class AccessRequestTimelineEdit extends Component {
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

  accessRequestFormSchema = Yup.object({
    secret_link_expiration: Yup.string().nullable(),
  });

  handleSubmit = async (values) => {
    this.setState({ loading: true, actionSuccess: false });
    const { request } = this.props;

    // TODO: don't update the whole payload if it's possible (https://github.com/inveniosoftware/invenio-rdm-records/issues/1402)
    const payload = request.payload;
    payload["secret_link_expiration"] = values.secret_link_expiration;

    const data = { payload: payload };
    this.cancellableAction = withCancel(http.put(request.links.self, data));

    try {
      await this.cancellableAction.promise;
      this.setState({ loading: false, actionSuccess: true, error: undefined });
    } catch (error) {
      if (error === "UNMOUNTED") return;

      this.setState({
        error: error,
        loading: false,
        actionSuccess: false,
      });
      console.error(error);
    }
  };

  renderErrorMessages(messages) {
    const uniqueMessages = [...new Set(messages)];
    if (uniqueMessages.length === 1) {
      return messages[0];
    } else {
      return (
        <ul>
          {uniqueMessages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      );
    }
  }

  errorMessage = () => {
    const { error } = this.state;
    const errorMessage = error?.response?.data?.message || error?.message;
    const listOfErrors = error?.response?.data?.errors;
    return (
      <Message className="mb-30" negative>
        {errorMessage}
        {listOfErrors &&
          listOfErrors.map((element) => (
            <Message.Item key={element.field}>
              <b>
                {/* Convert "payload.secret_link_expiration" into "Secret Link Expiration". */}
                {element.field
                  .split(".")
                  .pop()
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </b>
              : {this.renderErrorMessages(element.messages)}
            </Message.Item>
          ))}
      </Message>
    );
  };

  render() {
    const { request } = this.props;
    const { actionSuccess, loading, error } = this.state;
    const expirationDate = request.payload.secret_link_expiration;
    return (
      <>
        <Message
          icon="large edit outline"
          attached
          header={i18next.t("Access request")}
        />
        <Formik
          onSubmit={this.handleSubmit}
          enableReinitialize
          initialValues={{
            secret_link_expiration: expirationDate,
          }}
          validationSchema={this.accessRequestFormSchema}
        >
          {({ handleSubmit }) => {
            return (
              <Form className="attached fluid segment">
                {error && this.errorMessage()}
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={2}>
                      <strong>{i18next.t("Link expiration:")}</strong>
                    </Grid.Column>
                    <Grid.Column width={4}>
                      <Form.Field>
                        <TextField
                          placeholder={i18next.t("Date format: YYYY-MM-DD")}
                          fieldPath="secret_link_expiration"
                          icon="calendar alternate"
                        />
                        <label
                          htmlFor="access-request-expires-at"
                          className="helptext mb-0 mt-10"
                        >
                          {i18next.t(
                            "Expiration date: YYYY-MM-DD or never if blank (optional)."
                          )}
                        </label>
                      </Form.Field>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={4}>
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
              </Form>
            );
          }}
        </Formik>
        <br />
        <br />
      </>
    );
  }
}

AccessRequestTimelineEdit.propTypes = {
  request: PropTypes.object.isRequired,
};
