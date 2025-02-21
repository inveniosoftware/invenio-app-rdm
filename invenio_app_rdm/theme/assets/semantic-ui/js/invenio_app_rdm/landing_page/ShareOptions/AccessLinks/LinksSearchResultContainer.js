/*
 * This file is part of Invenio.
 * Copyright (C) 2023-2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import { i18next } from "@translations/invenio_app_rdm/i18next";
import React, { Component } from "react";
import _isEmpty from "lodash/isEmpty";
import { Table, Message, Loader } from "semantic-ui-react";
import PropTypes from "prop-types";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";
import { CreateAccessLink } from "./CreateAccessLink";
import { LinksSearchItem } from "./LinksSearchItem";
import { dropdownOptionsGenerator } from "react-invenio-forms";
import _cloneDeep from "lodash/cloneDeep";

export const dropdownOptions = [
  {
    key: "view",
    name: "view",
    text: i18next.t("Can view"),
    title: i18next.t("Can view"),
    value: "view",
    description: i18next.t("Can view restricted files of all versions of this record."),
  },
  {
    key: "preview",
    name: "preview",
    text: i18next.t("Can preview drafts"),
    title: i18next.t("Can preview drafts"),
    value: "preview",
    description: i18next.t(
      "Can view drafts, restricted files, and comment on associated draft requests of all versions of this record."
    ),
  },
  {
    key: "edit",
    name: "edit",
    text: i18next.t("Can edit"),
    title: i18next.t("Can edit"),
    value: "edit",
    description: i18next.t(
      "Can edit drafts, view restricted files, and comment on associated draft requests of all versions of this record."
    ),
  },
];

export class LinksSearchResultContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  renderErrorMessages(messages) {
    const uniqueMessages = [...new Set(messages)];
    if (uniqueMessages.length === 1) {
      return messages[0];
    } else {
      return (
        <ul>
          {uniqueMessages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      );
    }
  }

  errorMessage = () => {
    const { error } = this.state;
    const errorMessage = error?.response?.data?.message || error?.message;
    const listOfErrors = error?.response?.data?.errors;
    return (
      <Message className="mb-30" negative>
        {errorMessage}
        {listOfErrors &&
          listOfErrors.map((element) => (
            <Message.Item key={element.field}>
              <b>
                {element.field.charAt(0).toUpperCase() +
                  element.field.slice(1).replace("_", " ")}
              </b>
              : {this.renderErrorMessages(element.messages)}
            </Message.Item>
          ))}
      </Message>
    );
  };

  handleCreation = async (permission, expiresAt, description) => {
    const { onItemAddedOrDeleted, record } = this.props;
    this.setState({ loading: true });
    try {
      const data = {
        permission: permission,
        expires_at: expiresAt,
        description: description,
      };
      this.cancellableAction = withCancel(http.post(record.links.access_links, data));
      await this.cancellableAction.promise;
      onItemAddedOrDeleted(record.links.access_links, "links");
      this.setState({ loading: false, error: undefined });
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({
        loading: false,
        error: error,
      });
      console.error(error);
    }
  };

  generateDropdownOptions = () => {
    const { record } = this.props;

    // "can view" option is disabled for drafts
    const dropdownOptionsCopy = _cloneDeep(dropdownOptions);
    if (record?.is_draft || record?.is_draft === null) {
      const viewOption = dropdownOptionsCopy.find((item) => item.key === "view");
      viewOption.text = i18next.t(
        "Can view (view access link can be created only after the record is published)"
      );
    }

    const options = dropdownOptionsGenerator(dropdownOptionsCopy);
    if (record?.is_draft || record?.is_draft === null) {
      const viewOption = options.find((item) => item.key === "view");
      viewOption.disabled = true;
    }
    return options;
  };

  render() {
    const { results, record, onItemAddedOrDeleted, onPermissionChanged } = this.props;
    const { loading, error } = this.state;
    return (
      <>
        {error && this.errorMessage()}

        <Table className="fixed-header">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell data-label="Link title" width={3}>
                {i18next.t("Link title")}
              </Table.HeaderCell>
              <Table.HeaderCell data-label="Created" width={3}>
                {i18next.t("Created")}
              </Table.HeaderCell>
              <Table.HeaderCell data-label="Expires at" width={3}>
                {i18next.t("Expires")}
              </Table.HeaderCell>
              <Table.HeaderCell data-label="Access" width={3}>
                {i18next.t("Access")}
              </Table.HeaderCell>
              <Table.HeaderCell width={4} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Loader />
            ) : !_isEmpty(results) ? (
              results.map((result) => (
                <LinksSearchItem
                  key={result.id}
                  result={result}
                  record={record}
                  onItemAddedOrDeleted={onItemAddedOrDeleted}
                  onPermissionChanged={onPermissionChanged}
                  dropdownOptions={
                    result.permission === "view"
                      ? dropdownOptionsGenerator(dropdownOptions)
                      : this.generateDropdownOptions()
                  }
                />
              ))
            ) : (
              <Table.Row textAlign="center">
                <p className="mt-10">
                  <i>
                    <h5>{i18next.t("This record has no links generated yet.")}</h5>
                  </i>
                </p>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        <Table color="green">
          <CreateAccessLink
            handleCreation={this.handleCreation}
            loading={loading}
            record={record}
            dropdownOptions={this.generateDropdownOptions()}
          />
        </Table>
      </>
    );
  }
}

LinksSearchResultContainer.propTypes = {
  results: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  onItemAddedOrDeleted: PropTypes.func.isRequired,
  onPermissionChanged: PropTypes.func.isRequired,
};
