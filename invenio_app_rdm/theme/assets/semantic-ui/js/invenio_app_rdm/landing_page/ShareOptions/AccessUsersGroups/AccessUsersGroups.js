// This file is part of InvenioRDM
// Copyright (C) 2023-2024 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import _isEmpty from "lodash/isEmpty";
import { UserGroupAccessSearchResult } from "./UserGroupAccessSearchResult";
import React, { Component } from "react";
import { Modal, Loader, Button, Container } from "semantic-ui-react";
import PropTypes from "prop-types";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class AccessUsersGroups extends Component {
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
    const { endpoint } = this.props;
    this.setState({ loading: true });
    try {
      this.cancellableAction = withCancel(http.get(`${endpoint}?expand=true`));
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
    const {
      record,
      handleClose,
      permissions,
      emptyResultText,
      tableHeaderText,
      addButtonText,
      endpoint,
      searchBarTitle,
      selectedItemsHeader,
      fetchMembers,
      searchType,
      searchBarTooltip,
      searchBarPlaceholder,
      doneButtonTipType,
    } = this.props;
    const { results, loading, error } = this.state;
    return (
      <>
        {error && error}
        <Modal.Content>
          {loading && <Loader isLoading active />}
          {!loading && results !== undefined && (
            <UserGroupAccessSearchResult
              permissions={permissions}
              results={results}
              fetchData={this.fetchData}
              recOwner={record?.expanded?.parent?.access?.owned_by}
              setError={this.setError}
              tableHeaderText={tableHeaderText}
              addButtonText={addButtonText}
              searchBarTitle={searchBarTitle}
              selectedItemsHeader={selectedItemsHeader}
              endpoint={endpoint}
              record={record}
              fetchMembers={fetchMembers}
              searchType={searchType}
              searchBarTooltip={searchBarTooltip}
              searchBarPlaceholder={searchBarPlaceholder}
              doneButtonTipType={doneButtonTipType}
            />
          )}
          {_isEmpty(results) && (
            <Container className="mt-10" textAlign="center">
              <h5>{emptyResultText}</h5>
            </Container>
          )}
        </Modal.Content>
        <Modal.Actions className="ui clearing segment">
          <Button
            size="small"
            onClick={handleClose}
            floated="left"
            content={i18next.t("Close")}
          />
        </Modal.Actions>
      </>
    );
  }
}

AccessUsersGroups.propTypes = {
  record: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
  endpoint: PropTypes.string.isRequired,
  emptyResultText: PropTypes.string,
  tableHeaderText: PropTypes.string,
  addButtonText: PropTypes.string,
  searchBarTitle: PropTypes.string,
  doneButtonTipType: PropTypes.string,
  searchBarTooltip: PropTypes.string,
  searchBarPlaceholder: PropTypes.string,
  selectedItemsHeader: PropTypes.string,
  fetchMembers: PropTypes.func.isRequired,
  searchType: PropTypes.oneOf(["group", "user"]).isRequired,
};

AccessUsersGroups.defaultProps = {
  emptyResultText: "",
  tableHeaderText: "",
  addButtonText: "",
  searchBarTitle: "",
  searchBarTooltip: "",
  selectedItemsHeader: "",
  searchBarPlaceholder: "",
  doneButtonTipType: "",
};
