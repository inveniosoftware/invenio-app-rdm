/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * // Copyright (C) 2025 Graz University of Technology.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { RecordModerationApi } from "./api";
import { withCancel, ErrorMessage } from "react-invenio-forms";
import { Modal, Button, Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { CompareRevisionsDropdown } from "../components/CompareRevisionsDropdown";
import { RevisionsDiffViewer } from "../components/RevisionsDiffViewer";

export class CompareRevisions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: undefined,
      allRevisions: {},
      srcRevision: undefined,
      targetRevision: undefined,
      diff: undefined,
    };
  }

  componentDidMount() {
    this.fetchRevisions();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  async fetchRevisions() {
    const { resource } = this.props;
    this.setState({ loading: true });

    try {
      this.cancellableAction = withCancel(RecordModerationApi.getRevisions(resource));
      const response = await this.cancellableAction.promise;
      const revisions = await response.data;

      this.setState({
        allRevisions: revisions,
        targetRevision: revisions[0],
        srcRevision: revisions.length > 1 ? revisions[1] : revisions[0],
        loading: false,
      });
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({ error: error, loading: false });
      console.error(error);
    }
  }

  handleModalClose = () => {
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  handleCompare = (srcRevision, targetRevision) => {
    this.setState({ diff: { srcRevision, targetRevision } });
  };

  render() {
    const { error, loading, allRevisions, srcRevision, targetRevision, diff } =
      this.state;
    const options = Object.values(allRevisions).map((rev) => ({
      key: rev.updated,
      text: `${rev.updated} (${rev.revision_id})`,
      value: rev,
    }));

    return loading ? (
      <p>Loading...</p>
    ) : (
      <>
        <Modal.Content>
          <CompareRevisionsDropdown
            loading={loading}
            options={options}
            srcRevision={srcRevision}
            targetRevision={targetRevision}
            onCompare={this.handleCompare}
          />
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
          <Modal.Content scrolling>
            <RevisionsDiffViewer diff={diff} />
          </Modal.Content>
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

CompareRevisions.propTypes = {
  resource: PropTypes.object.isRequired,
  actionCancelCallback: PropTypes.func.isRequired,
};
