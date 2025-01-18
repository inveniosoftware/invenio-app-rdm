/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { RecordModerationApi } from "./api";
import { withCancel, ErrorMessage } from "react-invenio-forms";
import { Modal, Grid, Segment, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Differ, Viewer } from "json-diff-kit";
import { CompareRevisionsDropdown } from "../components/CompareRevisionsDropdown";

export class CompareRevisions extends Component {
  constructor(props) {
    super(props);
    this.differ = new Differ({
      detectCircular: true,
      maxDepth: null,
      showModifications: true,
      arrayDiffMethod: "lcs",
      ignoreCase: false,
      ignoreCaseForKey: false,
      recursiveEqual: true,
    });
    this.viewerProps = {
      indent: 4,
      lineNumbers: true,
      highlightInlineDiff: true,
      inlineDiffOptions: {
        mode: "word",
        wordSeparator: " ",
      },
      hideUnchangedLines: true,
      syntaxHighlight: false,
      virtual: true,
    };

    this.state = {
      loading: true,
      error: undefined,
      currentDiff: undefined,
      allRevisions: {},
      srcRevision: undefined,
      targetRevision: undefined,
    };
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

  componentDidMount() {
    this.fetchRevisions();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  computeDiff = () => {
    const { srcRevision, targetRevision } = this.state;
    if (srcRevision && targetRevision) {
      const diff = this.differ.diff(srcRevision, targetRevision);
      this.setState({ currentDiff: diff });
    }
  };

  handleModalClose = () => {
    const { actionCancelCallback } = this.props;
    actionCancelCallback();
  };

  render() {
    const { error, loading, currentDiff, allRevisions, srcRevision, targetRevision } =
      this.state;

    const options = Object.values(allRevisions).map((rev) => ({
      key: rev.updated,
      text: `${rev.updated} (${rev.revision_id})`,
      value: rev,
    }));

    return (
      <>
        <Modal.Content>
          <CompareRevisionsDropdown
            loading={loading}
            options={options}
            srcRevision={srcRevision}
            targetRevision={targetRevision}
            onSrcChange={(value) => this.setState({ srcRevision: value })}
            onTargetChange={(value) => this.setState({ targetRevision: value })}
            onCompare={this.computeDiff}
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
            {loading && <p>Loading...</p>}
            {!loading && currentDiff && (
              <Grid>
                <Grid.Column width={14}>
                  <Segment>
                    <Viewer diff={currentDiff} {...this.viewerProps} />
                  </Segment>
                </Grid.Column>
              </Grid>
            )}
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
  actionSuccessCallback: PropTypes.func.isRequired,
};
