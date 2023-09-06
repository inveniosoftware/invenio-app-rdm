/*
 * This file is part of Invenio.
 * Copyright (C) 2022 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import isEmpty from "lodash/isEmpty";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import { withCancel } from "react-invenio-forms";

import { UserModerationApi } from "./api";

export class UserActions extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, actionSuccess: undefined, error: undefined };
  }

  static contextType = NotificationContext;

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  handleAction = async (action) => {
    this.setState({ loading: true });
    const { user, successCallback } = this.props;
    const { addNotification } = this.context;
    const name = user.profile.full_name || user.profile.email || user.profile.username;
    let successNotification = {};

    if (action === "restore") {
      this.cancellableAction = withCancel(UserModerationApi.restoreUser(user));
      successNotification = {
        title: "Restored",
        content: `User ${name} was restored.`,
        type: "success",
      };
    } else if (action === "block") {
      this.cancellableAction = withCancel(UserModerationApi.blockUser(user));
      successNotification = {
        title: "Blocked",
        content: `User ${name} was blocked.`,
        type: "success",
      };
    } else if (action === "deactivate") {
      this.cancellableAction = withCancel(UserModerationApi.deactivateUser(user));
      successNotification = {
        title: "Deactivated",
        content: `User ${name} was deactivated.`,
        type: "success",
      };
    } else if (action === "approve") {
      this.cancellableAction = withCancel(UserModerationApi.approveUser(user));
      successNotification = {
        title: "Approved",
        content: `User ${name} was approved.`,
        type: "success",
      };
    }
    try {
      const result = await this.cancellableAction.promise;
      addNotification(successNotification);
      this.setState({ loading: false, actionSuccess: true });
      successCallback();
    } catch (e) {
      this.setState({ actionSuccess: undefined });
      addNotification({
        title: "Error",
        content: e.toString(),
        type: "error",
      });
    }
  };

  render() {
    const { user } = this.props;
    const { loading } = this.state;
    const isUserBlocked = !isEmpty(user.blocked_at);
    const isUserActive = user.active;
    const isUserVerified = !isEmpty(user.verified_at);

    return (
      <>
        {isUserBlocked && (
          <Button
            key="restore"
            onClick={() => this.handleAction("restore")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="undo"></Icon>
            Restore
          </Button>
        )}
        {isUserVerified && (
          <Button
            key="block"
            onClick={() => this.handleAction("block")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="ban"></Icon>
            Block
          </Button>
        )}
        {!isUserVerified && isUserActive && (
          <Button
            key="deactivate"
            onClick={() => this.handleAction("approve")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="check"></Icon>
            Approve
          </Button>
        )}
        {isUserActive && (
          <Button
            key="deactivate"
            onClick={() => this.handleAction("deactivate")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="pause"></Icon>
            Suspend
          </Button>
        )}
      </>
    );
  }
}

UserActions.propTypes = {
  user: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};
