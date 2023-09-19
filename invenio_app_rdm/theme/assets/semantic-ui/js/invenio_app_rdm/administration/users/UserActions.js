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
import { i18next } from "@translations/invenio_app_rdm/i18next";

import { UserModerationApi } from "./api";

export class UserActions extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

  handleAction = async (action) => {
    this.setState({ loading: true });
    const { user, successCallback } = this.props;
    const { addNotification } = this.context;
    const name = user.profile.full_name || user.profile.email || user.profile.username;
    let successNotification = {};

    if (action === "restore") {
      this.cancellableAction = withCancel(UserModerationApi.restoreUser(user));
      successNotification = {
        title: i18next.t("Restored"),
        content: i18next.t("User {{name}} was restored.", { name: name }),
        type: "success",
      };
    } else if (action === "block") {
      this.cancellableAction = withCancel(UserModerationApi.blockUser(user));
      successNotification = {
        title: i18next.t("Blocked"),
        content: i18next.t("User {{name}} was blocked.", { name: name }),
        type: "success",
      };
    } else if (action === "deactivate") {
      this.cancellableAction = withCancel(UserModerationApi.deactivateUser(user));
      successNotification = {
        title: i18next.t("Suspended"),
        content: i18next.t("User {{name}} was suspended.", { name: name }),
        type: "success",
      };
    } else if (action === "approve") {
      this.cancellableAction = withCancel(UserModerationApi.approveUser(user));
      successNotification = {
        title: i18next.t("Approved"),
        content: i18next.t("User {{name}} was approved.", { name: name }),
        type: "success",
      };
    }
    try {
      await this.cancellableAction.promise;
      addNotification(successNotification);
      this.setState({ loading: false });
      successCallback();
    } catch (e) {
      addNotification({
        title: i18next.t("Error"),
        content: e.toString(),
        type: "error",
      });
    }
  };

  render() {
    const { user, displaySuspend, displayBlock, displayApprove, displayRestore } =
      this.props;
    const { loading } = this.state;
    const isUserBlocked = !isEmpty(user.blocked_at);
    const isUserActive = user.active;
    const isUserVerified = !isEmpty(user.verified_at);

    return (
      <>
        {(isUserBlocked || displayRestore) && (
          <Button
            key="restore"
            onClick={() => this.handleAction("restore")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="undo" />
            {i18next.t("Restore")}
          </Button>
        )}

        {(!isUserBlocked || displayBlock) && (
          <Button
            key="block"
            onClick={() => this.handleAction("block")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="ban" />
            {i18next.t("Block")}
          </Button>
        )}
        {displayApprove ||
          (isUserActive && !isUserVerified && (
            <Button
              key="reactivate"
              onClick={() => this.handleAction("approve")}
              disabled={loading}
              loading={loading}
              icon
              labelPosition="left"
            >
              <Icon name="check" />
              {i18next.t("Reactivate")}
            </Button>
          ))}
        {(isUserActive || displaySuspend) && (
          <Button
            key="deactivate"
            onClick={() => this.handleAction("deactivate")}
            disabled={loading}
            loading={loading}
            icon
            labelPosition="left"
          >
            <Icon name="pause" />
            {i18next.t("Suspend")}
          </Button>
        )}
      </>
    );
  }
}

UserActions.propTypes = {
  user: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  displayBlock: PropTypes.bool,
  displaySuspend: PropTypes.bool,
  displayApprove: PropTypes.bool,
  displayRestore: PropTypes.bool,
};

UserActions.defaultProps = {
  displayBlock: false,
  displaySuspend: false,
  displayApprove: false,
  displayRestore: false,
};
