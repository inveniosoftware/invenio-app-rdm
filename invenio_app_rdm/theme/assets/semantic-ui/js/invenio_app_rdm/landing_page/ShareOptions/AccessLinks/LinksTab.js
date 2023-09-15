// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Modal, Loader, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";

import { LinksSearchResultContainer } from "./LinksSearchResultContainer";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";

export class LinksTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: undefined,
      loading: false,
      error: undefined,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  fetchData = async () => {
    const { record } = this.props;
    this.setState({ loading: true });
    try {
      this.cancellableAction = withCancel(http.get(record.links.access_links));
      const response = await this.cancellableAction.promise;
      this.setState({
        loading: false,
        error: undefined,
        results: response.data.hits.hits,
      });
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
    const { results, loading, error } = this.state;
    const { record, handleClose } = this.props;
    return (
      <>
        {error && error}
        <Modal.Content>
          {loading ? (
            <Loader />
          ) : (
            <LinksSearchResultContainer
              results={results}
              record={record}
              fetchData={this.fetchData}
            />
          )}
        </Modal.Content>
        <Modal.Actions className="ui clearing segment">
          <Button
            size="small"
            onClick={handleClose}
            content={i18next.t("Cancel")}
            icon="remove"
            className="left floated clearing"
          />
        </Modal.Actions>
      </>
    );
  }
}

LinksTab.propTypes = {
  record: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};
