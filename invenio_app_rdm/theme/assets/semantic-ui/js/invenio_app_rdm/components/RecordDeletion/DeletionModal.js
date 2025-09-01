// This file is part of InvenioRDM
// Copyright (C) 2025 CERN
//
// Invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Formik } from "formik";
import PropTypes from "prop-types";
import React, { Component } from "react";

import {
  ErrorMessage,
  http,
  SelectField,
  TextAreaField,
  withCancel,
} from "react-invenio-forms";
import {
  Button,
  Checkbox,
  Icon,
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
    const checklistLength = recordDeletion["checklist"]?.length || 0;
    this.initState = {
      loading: false,
      error: undefined,
      checklistState: Array(checklistLength).fill(undefined),
      checkboxState: Array(2).fill(false), // TODO dynamic count of number of checkboxes
      messages: [],
    };
    this.state = { ...this.initState };
  }

  handleClose = () => {
    this.setState({
      ...this.initState,
    });
    const { handleClose } = this.props;
    handleClose();
  };

  handleRadioUpdate = (index, value) => {
    const { recordDeletion } = this.props;
    const { checklistState } = this.state;
    const nextChecklistState = checklistState.map((c, i) => {
      if (i === index) {
        return value;
      } else {
        return c;
      }
    });
    const filteredChecklist = recordDeletion["checklist"].filter((_, index) => {
      return nextChecklistState[index];
    });
    const newMessages = filteredChecklist.map((x) => x["message"]);
    this.setState({ checklistState: nextChecklistState, messages: newMessages });
  };

  handleCheckboxUpdate = (index) => {
    const { checkboxState } = this.state;
    const nextCheckboxState = checkboxState.map((c, i) => {
      if (i === index) {
        return !checkboxState[i];
      } else {
        return c;
      }
    });
    this.setState({ checkboxState: nextCheckboxState });
  };

  deletionRequestSchema = (immediateDeletionAllowed) => {
    if (immediateDeletionAllowed) {
      return Yup.object({
        reason: Yup.string().required("Required"),
      });
    } else {
      return Yup.object({
        reason: Yup.string().required("Required"),
        comment: Yup.string()
          .min(25, "Please write at least 25 characters")
          .required("Required"),
      });
    }
  };

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
      try {
        const response = await this.cancellableAction.promise;
        const data = response.data;

        if (response.status === 200) {
          window.location.reload();
        } else if (response.status === 201) {
          window.location.href = data.links.self_html;
        }
      } catch (error) {
        this.setState({ error: error });
        console.error(error);
      } finally {
        this.setState({ loading: false });
      }
    } else {
      this.setState({ error: "Could not submit deletion request", loading: false });
    }
  };

  render() {
    const { open, recordDeletion, options } = this.props;
    const { loading, error, checklistState, checkboxState, messages } = this.state;

    const { checklist } = recordDeletion;

    if (!("recordDeletion" in recordDeletion)) {
      return null;
    }

    const immediateDeletionAllowed =
      recordDeletion["recordDeletion"]["immediate_deletion"]["allowed"];

    const modalHeaderText = immediateDeletionAllowed
      ? i18next.t("Delete record")
      : i18next.t("Request deletion");
    const deletionButtonText = immediateDeletionAllowed
      ? i18next.t("Delete immediately")
      : i18next.t("Request deletion");
    const deletionButtonClass = immediateDeletionAllowed ? "negative" : "primary";

    const files = recordDeletion["context"]["files"];
    const internalDoi = recordDeletion["context"]["internalDoi"];

    const formDisabled =
      checkboxState.some((v) => v === false) ||
      checklistState.some((x) => x === true || x === undefined);

    return (
      <Modal
        open={open}
        closeIcon
        onClose={this.handleClose}
        role="dialog"
        aria-modal="true"
        tab-index="-1"
        size="tiny"
        closeOnDimmerClick={false}
        onClick={(e) => e.stopPropagation()} // prevent interaction with dropdown
        onKeyDown={(e) => e.stopPropagation()} // prevent interaction with dropdown
      >
        <ModalHeader>{modalHeaderText}</ModalHeader>
        <Formik
          onSubmit={this.handleSubmit}
          validationSchema={this.deletionRequestSchema(immediateDeletionAllowed)}
          initialValues={{ reason: "", comment: "" }}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ handleSubmit }) => (
            <Form>
              <ModalContent>
                <>
                  {immediateDeletionAllowed ? (
                    <p>
                      {
                        recordDeletion["recordDeletion"]["immediate_deletion"][
                          "policy"
                        ]["description"]
                      }
                    </p>
                  ) : (
                    <p>
                      {
                        recordDeletion["recordDeletion"]["request_deletion"]["policy"][
                          "description"
                        ]
                      }
                    </p>
                  )}
                  <Message negative>
                    <Icon name="warning sign" />
                    {i18next.t("By deleting this record you acknowledge that:")}
                    <br />
                    <Checkbox
                      label={
                        /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
                        <label>
                          <strong>
                            {files} file{files !== 1 ? "s" : ""}
                          </strong>{" "}
                          {i18next.t("will be deleted.")}
                        </label>
                      }
                      className="mt-5 mb-5"
                      onChange={() => this.handleCheckboxUpdate(0)}
                    />
                    <br />
                    {internalDoi ? (
                      <Checkbox
                        label={
                          /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
                          <label>
                            <strong>{i18next.t("The DOI cannot be reused")}</strong>{" "}
                            {i18next.t(
                              "and the DOI will resolve to a tombstone page with the record's citation (including title, author/s, publication year and publisher)"
                            )}
                          </label>
                        }
                        className="mb-5"
                        onChange={() => this.handleCheckboxUpdate(1)}
                      />
                    ) : (
                      <Checkbox
                        label={
                          /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
                          <label>
                            {i18next.t(
                              "A tombstone page with the citation will replace the record page"
                            )}
                          </label>
                        }
                        className="mb-5"
                        onChange={() => this.handleCheckboxUpdate(1)}
                      />
                    )}
                  </Message>
                </>
                {checklist.length > 0 && (
                  <>
                    <strong>{i18next.t("Record deletion checklist:")}</strong>
                    <Table basic="very" unstackable className="mt-0">
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell />
                          <TableHeaderCell>{i18next.t("Yes")}</TableHeaderCell>
                          <TableHeaderCell>{i18next.t("No")}</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checklist.map((row, index) => (
                          <DeletionRadioGroup
                            index={index}
                            row={row}
                            key={row.name}
                            state={checklistState}
                            onStateChange={this.handleRadioUpdate}
                          />
                        ))}
                      </TableBody>
                    </Table>
                    {messages.length > 0 && (
                      <Message info>
                        {messages.length === 1 ? (
                          <p dangerouslySetInnerHTML={{ __html: messages[0] }} />
                        ) : (
                          <Message.List>
                            {messages.map((message) => (
                              <Message.Item key={message}>
                                <p dangerouslySetInnerHTML={{ __html: message }} />
                              </Message.Item>
                            ))}
                          </Message.List>
                        )}
                      </Message>
                    )}
                  </>
                )}
                <SelectField
                  fluid
                  fieldPath="reason"
                  name="reason"
                  label={i18next.t("I want to delete this record because:")}
                  options={options}
                  required
                  disabled={formDisabled}
                />

                {!immediateDeletionAllowed && (
                  <TextAreaField
                    fieldPath="comment"
                    name="comment"
                    label={i18next.t("Detailed justification:")}
                    required
                    placeholder={i18next.t(
                      "Your justification will not be shared publicly"
                    )}
                    disabled={formDisabled}
                  />
                )}
                {error && (
                  <ErrorMessage
                    header={i18next.t("Unable to request deletion.")}
                    content={i18next.t(error)}
                    icon="exclamation"
                    className="text-align-left"
                    negative
                  />
                )}
              </ModalContent>
              <ModalActions>
                <Button
                  onClick={this.handleClose}
                  content={i18next.t("Close")}
                  floated="left"
                />
                <Button
                  content={deletionButtonText}
                  className={deletionButtonClass}
                  icon="trash alternate outline"
                  type="submit"
                  onClick={(event) => handleSubmit(event)}
                  loading={loading}
                  disabled={formDisabled || loading}
                />
              </ModalActions>
            </Form>
          )}
        </Formik>
      </Modal>
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
