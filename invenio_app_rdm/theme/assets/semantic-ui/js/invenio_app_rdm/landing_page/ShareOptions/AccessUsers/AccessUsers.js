// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import _isEmpty from "lodash/isEmpty";
import { UserAccessSearchResult } from "./UserAccessSearchResult";
import isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import { Modal, Loader, Button, Container } from "semantic-ui-react";
import PropTypes from "prop-types";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class AccessUsers extends Component {
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

  setError = (error) => {
    this.setState({ error: error });
  };

  fetchData = async () => {
    const { record } = this.props;
    this.setState({ loading: true });
    try {
      this.cancellableAction = withCancel(
        http.get(`${record.links.access_users}?expand=true`)
      );
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
    const { record, handleClose, permissions } = this.props;

    const { results, loading, error } = this.state;

    return (
      <>
        {error && error}
        <Modal.Content>
          {loading && <Loader isLoading active />}
          {!loading && !isEmpty(results) && (
            <UserAccessSearchResult
              permissions={permissions}
              results={results}
              record={record}
              fetchData={this.fetchData}
              setError={this.setError}
            />
          )}
          {_isEmpty(results) && (
            <Container className="mt-10" textAlign="center">
              <h5>{i18next.t("No user has access to this record yet.")}</h5>
            </Container>
          )}
        </Modal.Content>
        <Modal.Actions className="ui clearing segment">
          <Button
            size="small"
            onClick={handleClose}
            floated="left"
            content={i18next.t("Cancel")}
            icon="remove"
          />
        </Modal.Actions>
      </>
    );
  }
}

AccessUsers.propTypes = {
  record: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
};
