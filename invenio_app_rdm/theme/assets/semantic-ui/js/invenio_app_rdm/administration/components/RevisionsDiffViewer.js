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
import { Grid, Container } from "semantic-ui-react";
import { Differ, Viewer } from "json-diff-kit";

export class RevisionsDiffViewer extends Component {
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
      currentDiff: undefined,
    };
  }

  componentDidUpdate(prevProps) {
    const { diff } = this.props;

    if (diff !== prevProps.diff) {
      this.computeDiff();
    }
  }

  computeDiff = () => {
    const { diff } = this.props;
    const _diff = this.differ.diff(diff?.srcRevision, diff?.targetRevision);
    this.setState({ currentDiff: _diff });
  };

  render() {
    const { currentDiff } = this.state;

    return currentDiff ? (
      <Grid>
        <Grid.Column width={16}>
          <Container fluid>
            <Viewer diff={currentDiff} {...this.viewerProps} />
          </Container>
        </Grid.Column>
      </Grid>
    ) : null;
  }
}

RevisionsDiffViewer.propTypes = {
  diff: PropTypes.object,
  viewerProps: PropTypes.object.isRequired,
};

RevisionsDiffViewer.defaultProps = {
  diff: {},
};
