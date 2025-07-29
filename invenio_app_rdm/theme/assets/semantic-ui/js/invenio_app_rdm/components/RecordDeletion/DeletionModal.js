// This file is part of InvenioRDM
// Copyright (C) 2025 CERN
//
// Invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Formik } from "formik";
import PropTypes from "prop-types";
import React, { Component } from "react";
import Overridable from "react-overridable";
import {
  ErrorMessage,
  http,
  SelectField,
  TextAreaField,
  withCancel,
} from "react-invenio-forms";
import {
  Button,
  Form,
  Message,
  Modal,
  ModalActions,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "semantic-ui-react";
import * as Yup from "yup";
import DeletionRadioGroup from "./DeletionRadioGroup";

export class DeletionModal extends Component {
  constructor(props) {
    super(props);
    const { record, recordDeletionChecklist } = this.props;
    this.state = {
      record: record,
      loading: false,
      error: undefined,
      checkboxes: Array(recordDeletionChecklist.length).fill(undefined),
    };
  }

  handleRadioUpdate = (index, value) => {
    const { checkboxes } = this.state;
    const nextCheckboxes = checkboxes.map((c, i) => {
      if (i === index) {
        return value;
      } else {
        return c;
      }
    });
    this.setState({ checkboxes: nextCheckboxes });
  };

  deletionRequestSchema = Yup.object({
    reason: Yup.string().required("Required"),
    comment: Yup.string()
      .min(25, "Please write at least 25 characters")
      .required("Required"),
  });

  handleSubmit = async (values) => {
    this.setState({ loading: true });
    const { record } = this.props;
    const payload = {
      reason: values.reason,
      comment: values.comment,
    };

    this.cancellableAction = withCancel(
      http.post(record.links.request_deletion, payload)
    );
  };

  render() {
    const { open, handleClose, recordDeletionChecklist, options } = this.props;
    const { loading, error, checkboxes } = this.state;

    return (
      <Overridable
        id="InvenioAppRDM.RecordDeletionModal.Layout"
        handleClose={handleClose}
        handleSubmit={this.handleSubmit}
        recordDeletionChecklist={recordDeletionChecklist}
        open={open}
      >
        <Modal
          open={open}
          closeIcon
          onClose={handleClose}
          role="dialog"
          aria-modal="true"
          tab-index="-1"
          size="tiny"
          closeOnDimmerClick={false}
        >
          <ModalHeader>Delete record</ModalHeader>
          <ModalContent>
            <Overridable id="InvenioAppRDM.RecordDeletionModal.Message">
              <Message negative>
                <p>
                  Deleting this record will delete <b>2</b> files.
                </p>
                <p>
                  <b>Zenodo DOIs cannot be reused</b> and the DOI will resolve to a{" "}
                  <a href="/">tombstone page</a>
                </p>
              </Message>
            </Overridable>
            <Overridable
              id="InvenioAppRDM.RecordDeletionModal.Table"
              recordDeletionChecklist={recordDeletionChecklist}
              handleRadioUpdate={this.handleRadioUpdate}
              checkboxes={checkboxes}
            >
              {recordDeletionChecklist.length > 0 && (
                <Table basic="very" unstackable>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell />
                      <TableHeaderCell>Yes</TableHeaderCell>
                      <TableHeaderCell>No</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordDeletionChecklist.map((row, index) => (
                      <DeletionRadioGroup
                        index={index}
                        row={row}
                        key={row.name}
                        state={checkboxes}
                        onStateChange={this.handleRadioUpdate}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </Overridable>
            <Overridable
              id="InvenioAppRDM.RecordDeletionModal.Formik"
              handleSubmit={this.handleSubmit}
              deletionRequestSchema={this.deletionRequestSchema}
            >
              <Formik
                onSubmit={this.handleSubmit}
                validationSchema={this.deletionRequestSchema}
                initialValues={{ reason: "", comment: "" }}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({ handleSubmit }) => {
                  return (
                    <Form>
                      <SelectField
                        fluid
                        fieldPath="reason"
                        name="reason"
                        label={i18next.t("I want to delete this record because")}
                        options={options}
                        required
                        disabled={checkboxes.some((x) => x || x === undefined)}
                      />

                      <TextAreaField
                        fieldPath="comment"
                        name="comment"
                        label={i18next.t("Comment")}
                        required
                        placeholder="Tell us more"
                        disabled={checkboxes.some((x) => x || x === undefined)}
                      />
                      {error && (
                        <ErrorMessage
                          header={i18next.t("Unable to request deletion.")}
                          content={i18next.t(error)}
                          icon="exclamation"
                          className="text-align-left"
                          negative
                        />
                      )}
                      <Button
                        onClick={handleClose}
                        content={i18next.t("Close")}
                        className="left"
                      />
                      <Button
                        content={i18next.t("Delete record immediately")}
                        className="negative right floated"
                        icon="trash alternate outline"
                        labelPosition="left"
                        onClick={(event) => handleSubmit(event)}
                        loading={loading}
                        positive
                        disabled={
                          checkboxes.some((x) => x || x === undefined) || loading
                        }
                      />
                    </Form>
                  );
                }}
              </Formik>
            </Overridable>
          </ModalContent>
          <Overridable id="InvenioAppRDM.RecordDeletionModal.ModalActions">
            <ModalActions>
              <p size="tiny">
                Zenodo has a <a href="/">30 day grace period</a>. 28 days remain to
                delete this record immediately
              </p>
            </ModalActions>
          </Overridable>
        </Modal>
      </Overridable>
    );
  }
}

DeletionModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  recordDeletionChecklist: PropTypes.array,
  options: PropTypes.array.isRequired,
};

DeletionModal.defaultProps = {
  recordDeletionChecklist: [],
};
