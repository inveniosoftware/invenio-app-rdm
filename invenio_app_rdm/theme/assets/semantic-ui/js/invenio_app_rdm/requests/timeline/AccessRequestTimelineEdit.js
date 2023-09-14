// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Grid, Form, Button, Header, Segment } from "semantic-ui-react";
import { Formik } from "formik";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SuccessIcon } from "@js/invenio_communities/members";
import { http, withCancel, ErrorMessage, TextField } from "react-invenio-forms";
import * as Yup from "yup";
import { DateTime } from "luxon";

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
    secret_link_expiration: Yup.date()
      .typeError(i18next.t("Invalid date format."))
      .min(
        DateTime.now().toJSDate(),
        i18next.t("Access link expiration date cannot be in the past.")
      )
      .nullable(),
  });

  handleSubmit = async (values) => {
    this.setState({ loading: true, actionSuccess: false });
    const { request } = this.props;

    const {
      payload,
      links: { self: selfLink },
    } = request;
    const { secret_link_expiration: secretLinkExpiration } = values;
    if (secretLinkExpiration === null) {
      payload["secret_link_expiration"] = "0";
    } else {
      const date = DateTime.fromISO(secretLinkExpiration);
      const days = date.diff(DateTime.now(), "days").days;

      // update days to expiration
      payload["secret_link_expiration"] = Math.ceil(days).toString();
    }
    const data = { payload: payload };
    this.cancellableAction = withCancel(http.put(selfLink, data));

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

  initFormValues = () => {
    const {
      request: {
        payload: { secret_link_expiration },
      },
    } = this.props;

    if (parseInt(secret_link_expiration) === 0) {
      return {
        secret_link_expiration: "",
      };
    }
    const dateFromDays = DateTime.now().plus({
      days: parseInt(secret_link_expiration),
    });
    return {
      secret_link_expiration: dateFromDays.toISODate(),
    };
  };

  render() {
    const { actionSuccess, loading, error } = this.state;
    return (
      <>
        <Header
          icon="edit outline"
          attached="top"
          className="highlight"
          content={i18next.t("Access request")}
        />
        <Formik
          onSubmit={this.handleSubmit}
          enableReinitialize
          initialValues={this.initFormValues()}
          validationSchema={this.accessRequestFormSchema}
        >
          {({ values, handleSubmit }) => {
            return (
              <Segment attached="bottom">
                <Form>
                  {error && (
                    <ErrorMessage
                      header={i18next.t(
                        "Unable to change the expiration request settings."
                      )}
                      content={i18next.t(error)}
                      icon="exclamation"
                      className="text-align-left"
                      negative
                    />
                  )}
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={12}>
                        <Form.Field inline>
                          <TextField
                            inline
                            fluid={false}
                            fieldPath="secret_link_expiration"
                            value={values.secret_link_expiration}
                            label={i18next.t("Expiration date: ")}
                            helpText={i18next.t(
                              "Format: YYYY-MM-DD. Granted access will expire on the given date. Leave empty to set no expiration limit."
                            )}
                            icon="calendar alternate"
                          />
                        </Form.Field>
                      </Grid.Column>
                      <Grid.Column width={4} textAlign="right">
                        {actionSuccess && (
                          <SuccessIcon
                            className="mr-10"
                            timeOutDelay={3000}
                            show={actionSuccess}
                          />
                        )}
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
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Form>
              </Segment>
            );
          }}
        </Formik>
      </>
    );
  }
}

AccessRequestTimelineEdit.propTypes = {
  request: PropTypes.object.isRequired,
};
