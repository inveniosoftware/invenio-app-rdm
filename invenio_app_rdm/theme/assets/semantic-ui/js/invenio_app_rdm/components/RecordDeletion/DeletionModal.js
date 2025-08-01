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
    const { recordDeletion } = this.props;
    this.state = {
      loading: false,
      error: undefined,
      checkboxes: Array(recordDeletion["checklist"].length).fill(undefined),
      messages: [],
    };
  }

  handleRadioUpdate = (index, value) => {
    const { recordDeletion } = this.props;
    const { checkboxes } = this.state;
    const nextCheckboxes = checkboxes.map((c, i) => {
      if (i === index) {
        return value;
      } else {
        return c;
      }
    });
    const filteredChecklist = recordDeletion["checklist"].filter((_, index) => {
      return nextCheckboxes[index];
    });
    const newMessages = filteredChecklist.map((x) => x["message"]);
    this.setState({ checkboxes: nextCheckboxes, messages: newMessages });
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
    if ("request_deletion" in record.links) {
      this.cancellableAction = withCancel(
        http.post(record.links.request_deletion, payload)
      );
    } else {
      this.setState({ error: "Could not submit deletion request", loading: false });
    }
  };

  render() {
    const { open, handleClose, recordDeletion, options } = this.props;
    const { loading, error, checkboxes, messages } = this.state;

    const { checklist } = recordDeletion;

    const immediateDeletionAllowed =
      recordDeletion["recordDeletion"]["immediate_deletion"]["allowed"];

    const deletionButtonText = immediateDeletionAllowed
      ? i18next.t("Delete record immediately")
      : i18next.t("Request record deletion");

    const files = recordDeletion["context"]["files"];
    const internalDoi = recordDeletion["context"]["internalDoi"];

    return (
      <Overridable
        id="InvenioAppRDM.RecordDeletionModal.Layout"
        handleClose={handleClose}
        handleSubmit={this.handleSubmit}
        recordDeletion={recordDeletion}
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
                  Deleting this record will delete{" "}
                  <b>
                    {files} file{files !== 1 ? "s" : ""}
                  </b>
                  .
                </p>
                {internalDoi && (
                  <p>
                    The <b>DOI cannot be reused</b> and the DOI will resolve to a
                    tombstone page
                  </p>
                )}
              </Message>
            </Overridable>
            <Overridable
              id="InvenioAppRDM.RecordDeletionModal.Table"
              recordDeletion={recordDeletion}
              handleRadioUpdate={this.handleRadioUpdate}
              checkboxes={checkboxes}
            >
              {checklist.length > 0 && (
                <>
                  <b>Record deletion checklist:</b>
                  <Table basic="very" unstackable className="mt-0">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Yes</TableHeaderCell>
                        <TableHeaderCell>No</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checklist.map((row, index) => (
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
                  {messages.length > 0 && (
                    <Message info>
                      {messages.length === 1 ? (
                        messages[0]
                      ) : (
                        <Message.List>
                          {messages.map((message) => (
                            <Message.Item key={message}>{message}</Message.Item>
                          ))}
                        </Message.List>
                      )}
                    </Message>
                  )}
                </>
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
                        content={deletionButtonText}
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
              <p className="text-align-left font-size-small">
                {immediateDeletionAllowed
                  ? recordDeletion["recordDeletion"]["immediate_deletion"]["policy"][
                      "description"
                    ]
                  : recordDeletion["recordDeletion"]["request_deletion"]["policy"][
                      "description"
                    ]}
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
  recordDeletion: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
};
