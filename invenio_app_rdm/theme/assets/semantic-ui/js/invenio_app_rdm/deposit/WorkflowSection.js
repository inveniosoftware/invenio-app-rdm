// This file is part of InvenioRDM
// Copyright (C) 2026 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Message, Icon } from "semantic-ui-react";
import { WorkflowButton } from "../components/WorkflowButton";
import { WorkflowStreamAccordion } from "../components/WorkflowStreamAccordion";

export class WorkflowSection extends Component {
  state = {
    isLoading: false,
    success: false,
    error: null,
    streamOutput: "",
    isStreaming: false,
  };

  handleStreamStart = (source) => {
    this.setState({
      isLoading: false,
      success: true,
      streamOutput: "",
      isStreaming: true,
    });

    source.onmessage = (event) => {
      this.setState((prev) => ({
        streamOutput: prev.streamOutput + event.data + "\n",
      }));
    };

    source.onerror = () => {
      source.close();
      this.setState({ isStreaming: false });
    };

    source.addEventListener("done", () => {
      source.close();
      this.setState({ isStreaming: false });
    });
  };

  handleError = (message) => {
    this.setState({ isLoading: false, error: message, success: false });
  };

  render() {
    const { record } = this.props;
    const { isLoading, success, error, streamOutput, isStreaming } = this.state;

    return (
      <Grid className="mt-10">
        <Grid.Row>
          <Grid.Column width={6} floated="right">
            <WorkflowButton
              record={record}
              isLoading={isLoading}
              success={success}
              onStreamStart={this.handleStreamStart}
              onError={this.handleError}
            />
          </Grid.Column>
        </Grid.Row>

        {error && (
          <Grid.Row>
            <Grid.Column width={6}>
              <Message
                negative
                size="small"
                onDismiss={() => this.setState({ error: null })}
              >
                <Icon name="warning circle" />
                {error}
              </Message>
            </Grid.Column>
          </Grid.Row>
        )}

        {streamOutput && (
          <Grid.Row>
            <Grid.Column width={16}>
              <WorkflowStreamAccordion
                streamOutput={streamOutput}
                isStreaming={isStreaming}
              />
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    );
  }
}

WorkflowSection.propTypes = {
  record: PropTypes.object.isRequired,
};
