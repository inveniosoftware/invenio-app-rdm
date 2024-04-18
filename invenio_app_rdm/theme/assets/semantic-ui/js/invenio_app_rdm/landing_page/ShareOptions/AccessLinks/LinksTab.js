// This file is part of InvenioRDM
// Copyright (C) 2023-2024 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Modal, Loader } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { ErrorMessage } from "react-invenio-forms";
import { LinksSearchResultContainer } from "./LinksSearchResultContainer";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";

export class LinksTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentDidMount() {
    this.fetchLinks();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  onLinksAddedOrDeleted = async () => {
    await this.fetchLinks(true);
  };

  onPermissionChanged = (id, permission) => {
    const { results } = this.props;
    results.forEach((result) => {
      if (result.id === id) {
        result.permission = permission;
      }
    });
  };

  fetchLinks = async (isDataChanged) => {
    const { record, results, updateLinksState } = this.props;
    if (results && !isDataChanged) return;

    this.setState({ loading: true });
    try {
      this.cancellableAction = withCancel(http.get(record.links.access_links));
      const response = await this.cancellableAction.promise;

      this.setState({
        loading: false,
        error: undefined,
      });
      updateLinksState(response.data.hits.hits, isDataChanged);
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({
        loading: false,
        error: error,
      });
      console.error(error);
    }
  };

  render() {
    const { record, results } = this.props;
    const { loading, error } = this.state;
    return (
      <>
        {error && (
          <ErrorMessage
            header={i18next.t("Something went wrong")}
            content={error?.response?.data?.message || error.message}
            icon="exclamation"
            negative
            size="mini"
          />
        )}
        <Modal.Content className="share-content">
          {loading && <Loader />}
          {!loading && results !== undefined && (
            <LinksSearchResultContainer
              results={results}
              record={record}
              onItemAddedOrDeleted={this.onLinksAddedOrDeleted}
              onPermissionChanged={this.onPermissionChanged}
            />
          )}
        </Modal.Content>
      </>
    );
  }
}

LinksTab.propTypes = {
  record: PropTypes.string.isRequired,
  results: PropTypes.array.isRequired,
  updateLinksState: PropTypes.func.isRequired,
};
