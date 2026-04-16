/*
 * This file is part of Invenio.
 * Copyright (C) 2026 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { ErrorMessage, Image, TextAreaField, withCancel } from "react-invenio-forms";
import { Button, Form, Header, Icon, Message, Modal, Segment } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import * as Yup from "yup";
import RemovalReasonsSelect from "../records/RemovalReasonsSelect";
import { UserModerationApi } from "./api";

export default class UserBlockForm extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, error: undefined, blocked: false };
    this.schema = Yup.object({
      removal_reason: Yup.string().required(i18next.t("A removal reason is required.")),
      note: Yup.string(),
    });
  }

  static contextType = NotificationContext;

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  handleSubmit = async (values) => {
    const { user } = this.props;
    const { addNotification } = this.context;
    const name = user.profile?.full_name || user.email || user.username || user.id;

    this.setState({ loading: true });

    const payload = {
      removal_reason_id: values.removal_reason,
      ...(values.note ? { note: values.note } : {}),
    };

    this.cancellableAction = withCancel(UserModerationApi.blockUser(user, payload));

    try {
      await this.cancellableAction.promise;
      this.cancellableAction = null;
      this.setState({ loading: false, error: undefined, blocked: true });
      // Fire the notification for pages that mount a NotificationController
      // (admin views). The in-modal confirmation handles the rest.
      addNotification({
        title: i18next.t("Blocked"),
        content: i18next.t("User {{name}} was blocked.", { name }),
        type: "success",
      });
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.cancellableAction = null;
      this.setState({
        loading: false,
        error: error?.response?.data?.message || error?.message,
      });
      console.error(error);
    }
  };

  renderUserSummary() {
    const { user } = this.props;
    const displayName =
      user.profile?.full_name || user.username || user.email || user.id;
    const hasIdentities = user.identities?.orcid || user.identities?.github;

    return (
      <Segment>
        <Header as="h4" className="mt-0 mb-5">
          {user.links?.avatar && (
            <Image
              src={user.links.avatar}
              avatar
              inline
              size="mini"
              className="mr-10"
              loadFallbackFirst
            />
          )}
          <strong>{displayName}</strong>
        </Header>
        <div className="text-muted mb-5">
          {user.username && <span>@{user.username}</span>}
          {user.username && user.profile?.affiliations && <span> · </span>}
          {user.profile?.affiliations && (
            <span>
              <Icon name="university" />
              {user.profile.affiliations}
            </span>
          )}
        </div>
        {(user.email || hasIdentities) && (
          <div>
            {user.email && (
              <a className="mr-15" href={`mailto:${user.email}`}>
                <Icon name="mail" />
                {user.email}
              </a>
            )}
            {user.identities?.orcid && (
              <a
                className="mr-15"
                href={`https://orcid.org/${user.identities.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="linkify" />
                {user.identities.orcid}
              </a>
            )}
            {user.identities?.github && (
              <a
                href={`https://github.com/${user.identities.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="github" />
                {user.identities.github}
              </a>
            )}
          </div>
        )}
      </Segment>
    );
  }

  render() {
    const { actionCancelCallback, actionSuccessCallback, user } = this.props;
    const { loading, error, blocked } = this.state;

    if (blocked) {
      const params = new URLSearchParams({
        q: `id:${user.id}`,
        f: "is_blocked:1",
      });
      const adminUrl = `/administration/users?${params}`;
      return (
        <>
          <Modal.Content>
            {this.renderUserSummary()}
            <Message positive className="mt-15">
              <div className="align-items-center justify-space-between flex">
                <div>
                  <Message.Header>
                    <Icon name="check circle" />
                    {i18next.t("User blocked")}
                  </Message.Header>
                  <p className="mt-5 mb-0">
                    {i18next.t(
                      "Their records and communities are being tombstoned in the background. This may take a few minutes to complete."
                    )}
                  </p>
                </div>
                <Button
                  as="a"
                  size="small"
                  className="ml-15"
                  style={{ whiteSpace: "nowrap" }}
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18next.t("View in admin")}
                  <Icon name="external alternate" className="ml-5" />
                </Button>
              </div>
            </Message>
          </Modal.Content>
          <Modal.Actions>
            <Button primary onClick={actionSuccessCallback}>
              {i18next.t("Close")}
            </Button>
          </Modal.Actions>
        </>
      );
    }

    return (
      <Formik
        initialValues={{ removal_reason: undefined, note: "" }}
        onSubmit={this.handleSubmit}
        validationSchema={this.schema}
        validateOnMount
      >
        {({ handleSubmit, setFieldValue, isValid }) => (
          <Form onSubmit={handleSubmit} className="full-width">
            {error && (
              <ErrorMessage
                header={i18next.t("Unable to block user")}
                content={error}
                icon="exclamation"
                className="text-align-left"
                negative
              />
            )}
            <Modal.Content>
              {this.renderUserSummary()}
              <p className="mt-15">
                {i18next.t(
                  "Blocking this user will tombstone their records and communities using the removal reason below."
                )}
              </p>
              <Form.Field required>
                <RemovalReasonsSelect setFieldValue={setFieldValue} />
              </Form.Field>
              <Form.Field>
                <TextAreaField
                  fieldPath="note"
                  label={i18next.t("Public note")}
                  fluid
                />
              </Form.Field>
            </Modal.Content>
            <Modal.Actions>
              <Button type="button" onClick={actionCancelCallback} floated="left">
                {i18next.t("Cancel")}
              </Button>
              <Button
                type="submit"
                icon="ban"
                labelPosition="left"
                color="red"
                content={i18next.t("Block user")}
                loading={loading}
                disabled={loading || !isValid}
              />
            </Modal.Actions>
          </Form>
        )}
      </Formik>
    );
  }
}

UserBlockForm.propTypes = {
  user: PropTypes.object.isRequired,
  actionSuccessCallback: PropTypes.func.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
};
