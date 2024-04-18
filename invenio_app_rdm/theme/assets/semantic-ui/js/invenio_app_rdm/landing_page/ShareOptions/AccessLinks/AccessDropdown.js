/*
 * This file is part of Invenio.
 * Copyright (C) 2023-2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { http } from "react-invenio-forms";
import { SuccessIcon, ErrorPopup } from "@js/invenio_communities/members";
import { withCancel } from "react-invenio-forms";

export const errorSerializer = (error) =>
  error?.response?.data?.message || error?.message;

const MIN_LOADING_DURATION = 400;

export class AccessDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { error: undefined, loading: false, actionSuccess: undefined };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  onSuccess = () =>
    this.setState({ loading: false, actionSuccess: true, error: undefined });

  handleUpdate = async (permission) => {
    const { updateEndpoint, onPermissionChanged, result, entityType } = this.props;
    const data = { permission: permission };
    this.setState({ loading: true, actionSuccess: false });
    this.cancellableAction = withCancel(http.patch(updateEndpoint, data));

    try {
      // prolong loading to make sure UI displays to the end user for long enough that the action was completed
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, MIN_LOADING_DURATION)),
        this.cancellableAction.promise,
      ]);
      this.onSuccess();
      onPermissionChanged(
        result?.subject?.id ?? result.id,
        data.permission,
        entityType
      );
    } catch (error) {
      if (error === "UNMOUNTED") return;
      this.setState({
        loading: false,
        actionSuccess: false,
        error: errorSerializer(error),
      });
      console.error(error);
    }
  };

  render() {
    const { result, dropdownOptions } = this.props;
    const { loading, actionSuccess, error } = this.state;
    return (
      <div className="flex align-items-center access-dropdown-container">
        <Dropdown
          className="overflow-scroll"
          placeholder={i18next.t("Select permissions")}
          fluid
          loading={loading}
          selection
          options={dropdownOptions}
          onChange={(event, data) => this.handleUpdate(data.value)}
          defaultValue={result.permission}
        />
        <div className="ml-5 action-status-container">
          {actionSuccess && <SuccessIcon timeOutDelay={3000} show={actionSuccess} />}
          {error && <ErrorPopup error={error} />}
        </div>
      </div>
    );
  }
}

AccessDropdown.propTypes = {
  result: PropTypes.object.isRequired,
  dropdownOptions: PropTypes.array.isRequired,
  updateEndpoint: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  onPermissionChanged: PropTypes.func.isRequired,
};
