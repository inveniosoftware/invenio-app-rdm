// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { AccessUsersGroups } from "./AccessUsersGroups";
import { withCancel } from "react-invenio-forms";
import { http } from "react-invenio-forms";

export class PeopleTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  onUserAddedOrDeleted = async () => {
    await this.fetchUsers(true);
  };

  onPermissionChanged = (id, permission) => {
    const { results } = this.props;
    results.forEach((result) => {
      if (result.subject.id === id) {
        result.permission = permission;
      }
    });
  };

  fetchUsers = async (isDataChanged) => {
    const { record, results, updateUsersState } = this.props;
    if (results && !isDataChanged) return;

    this.setState({ loading: true });
    try {
      this.cancellableAction = withCancel(
        http.get(`${record.links.access_users}?expand=true`)
      );
      const response = await this.cancellableAction.promise;
      this.setState({
        loading: false,
        error: undefined,
      });
      updateUsersState(response.data.hits.hits, isDataChanged);
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
    const { loading, error } = this.state;
    const { record, permissions, results } = this.props;
    return (
      <AccessUsersGroups
        searchType="user"
        record={record}
        permissions={permissions}
        endpoint={`${record.links.access_users}`}
        results={results}
        loading={loading}
        error={error}
        onGrantAddedOrDeleted={this.onUserAddedOrDeleted}
        onPermissionChanged={this.onPermissionChanged}
      />
    );
  }
}

PeopleTab.propTypes = {
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  updateUsersState: PropTypes.func.isRequired,
};
