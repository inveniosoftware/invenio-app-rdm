// This file is part of InvenioRDM
// Copyright (C) 2026 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popup, Message, Icon } from "semantic-ui-react";
import { connect as connectFormik } from "formik";
import { connect } from "react-redux";
import _get from "lodash/get";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { http } from "react-invenio-forms";

class WorkflowButtonComponent extends Component {
  state = {
    isLoading: false,
    error: null,
    success: false,
  };

  hasAllCompletedFiles = () => {
    const { fileEntries } = this.props;
    const files = Object.values(fileEntries ?? {});
    return files.length > 0 && files.every((file) => file.status === "finished");
  };

  isDisabled = (values, isSubmitting) => {
    const { disabled } = this.props;
    const { isLoading } = this.state;
    if (disabled || isLoading || isSubmitting) return true;

    const filesEnabled = _get(values, "files.enabled", false);
    return filesEnabled && !this.hasAllCompletedFiles();
  };

  handleClick = async () => {
    const { record, formik } = this.props;

    const recordId = record?.id ? record.id : formik?.values?.id;
    if (!recordId) {
      this.setState({
        error: i18next.t("Upload at least one file first."),
        success: false,
      });
      return;
    }

    if (!this.hasAllCompletedFiles()) {
      this.setState({
        error: i18next.t("Wait until file uploads are complete."),
        success: false,
      });
      return;
    }

    this.setState({ isLoading: true, error: null, success: false });

    try {
      await http.post(`/uploads/${recordId}/workflow`);
      this.setState({ isLoading: false, success: true });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        i18next.t("An error occurred");

      this.setState({ isLoading: false, error: message, success: false });
    }
  };

  render() {
    const { formik } = this.props;
    const { values, isSubmitting } = formik;

    const { isLoading, error, success } = this.state;

    const isButtonDisabled = this.isDisabled(values, isSubmitting);

    return (
      <div>
        <Popup
          content={
            isButtonDisabled
              ? i18next.t("Upload at least one file first.")
              : i18next.t(`Send (for now) the first file to the AI workflow`)
          }
          trigger={
            <span>
              <Button
                fluid
                onClick={this.handleClick}
                disabled={isButtonDisabled}
                loading={isLoading}
                primary
                size="medium"
                labelPosition="left"
                icon={success ? "check" : "magic"}
                content={
                  success
                    ? i18next.t("Workflow started!")
                    : i18next.t("Extract Metadata")
                }
                aria-label={
                  success
                    ? i18next.t("Workflow started!")
                    : i18next.t("Extract Metadata")
                }
              />
            </span>
          }
        />

        {error && (
          <Message
            negative
            size="small"
            className="mt-1"
            onDismiss={() => this.setState({ error: null })}
          >
            <Icon name="warning circle" />
            {error}
          </Message>
        )}
      </div>
    );
  }
}

WorkflowButtonComponent.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  fileEntries: PropTypes.object.isRequired,
};

WorkflowButtonComponent.defaultProps = {
  disabled: false,
};

const mapStateToProps = (state) => ({
  fileEntries: state.files?.entries ?? {},
});

export const WorkflowButton = connect(
  mapStateToProps,
  null
)(connectFormik(WorkflowButtonComponent));
