/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { RecordModerationApi } from "../records/api";
import { withCancel, ErrorMessage } from "react-invenio-forms";
import { Modal, Button, Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { RevisionsDiffViewer } from "../components/RevisionsDiffViewer";

export class ViewRecentChanges extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: undefined,
      diff: undefined,
    };
  }

  async fetchPreviousRevision() {
    const { resource } = this.props;
    const {
      resource: record,
      metadata: { revision_id: targetRevision } = { revision_id: null },
    } = resource;
    this.setState({ loading: true });

    try {
      if (!targetRevision) {
        this.setState({
          error: i18next.t("No revision ID found."),
          loading: false,
        });
        return;
      }
      this.cancellableAction = withCancel(
        RecordModerationApi.getLastRevision(record, targetRevision, true)
      );
      const response = await this.cancellableAction.promise;
      const revisions = await response.data;

      this.setState({
        diff: {
          targetRevision: revisions[0],
          srcRevision: revisions.length > 1 ? revisions[1] : revisions[0],
        },
        loading: false,
      });
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({ error: error, loading: false });
      console.error(error);
    }
  }

  componentDidMount() {
    this.fetchPreviousRevision();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  handleModalClose = () => {
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  render() {
    const { error, loading, diff } = this.state;

    return (
      <>
        <Modal.Content>
          {error && (
            <Modal.Content>
              <ErrorMessage
                header={i18next.t("Unable to fetch revisions.")}
                content={error}
                icon="exclamation"
                className="text-align-left"
                negative
              />
            </Modal.Content>
          )}
        </Modal.Content>
        <Modal.Content scrolling>
          <RevisionsDiffViewer diff={diff} />
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Column floated="left" width={8} textAlign="left">
              <Button
                onClick={this.handleModalClose}
                disabled={loading}
                loading={loading}
                aria-label={i18next.t("Cancel revision comparison")}
              >
                Close
              </Button>
            </Grid.Column>
          </Grid>
        </Modal.Actions>
      </>
    );
  }
}

ViewRecentChanges.propTypes = {
  resource: PropTypes.object.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
};
