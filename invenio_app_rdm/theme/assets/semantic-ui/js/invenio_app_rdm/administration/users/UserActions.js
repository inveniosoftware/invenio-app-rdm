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
import { Button, Icon, Dropdown } from "semantic-ui-react";
import { NotificationContext } from "@js/invenio_administration";
import { withCancel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { ImpersonateUser } from "../components/ImpersonateUser";
import { SetQuotaAction } from "../components/SetQuotaAction";
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
    const name = user.profile?.full_name || user.email || user.username || user.id;

    const actionConfig = {
      restore: {
        label: i18next.t("Restore"),
        icon: "undo",
        apiFunction: UserModerationApi.restoreUser,
        notificationTitle: i18next.t("Restored"),
      },
      block: {
        label: i18next.t("Block"),
        icon: "ban",
        apiFunction: UserModerationApi.blockUser,
        notificationTitle: i18next.t("Blocked"),
      },
      deactivate: {
        label: i18next.t("Suspend"),
        icon: "pause",
        apiFunction: UserModerationApi.deactivateUser,
        notificationTitle: i18next.t("Suspended"),
      },
      approve: {
        label: i18next.t("Approve"),
        icon: "check",
        apiFunction: UserModerationApi.approveUser,
        notificationTitle: i18next.t("Approved"),
      },
    }[action];

    if (actionConfig) {
      this.cancellableAction = withCancel(actionConfig.apiFunction(user));
      const successNotification = {
        title: actionConfig.notificationTitle,
        content: i18next.t(
          `User {{name}} was ${actionConfig.notificationTitle.toLowerCase()}.`,
          {
            name: name,
          }
        ),
        type: "success",
      };

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
    }
  };

  render() {
    const {
      user,
      displaySuspend,
      displayBlock,
      displayApprove,
      displayRestore,
      successCallback,
      displayImpersonateUser,
      displayQuota,
      useDropdown,
    } = this.props;
    const { loading } = this.state;
    const isUserBlocked = !isEmpty(user.blocked_at);
    const isUserActive = user.active;
    const isUserVerified = !isEmpty(user.verified_at);

    const actionItems = [
      { key: "approve", label: "Verify", icon: "check" },
      { key: "restore", label: "Restore", icon: "undo" },
      { key: "block", label: "Block", icon: "ban" },
      { key: "deactivate", label: "Suspend", icon: "pause" },
    ];

    const filteredActions = actionItems.filter((actionItem) => {
      return (
        (actionItem.key === "restore" && (isUserBlocked || displayRestore)) ||
        (actionItem.key === "block" && (!isUserBlocked || displayBlock)) ||
        (actionItem.key === "deactivate" && (isUserActive || displaySuspend)) ||
        (actionItem.key === "approve" &&
          (displayApprove || (isUserActive && !isUserVerified)))
      );
    });

    const generateActions = () => {
      return (
        <>
          {displayQuota && (
            <SetQuotaAction
              headerText={i18next.t("Set default quota for {{email}}", {
                email: user.email,
              })}
              successCallback={successCallback}
              apiUrl={`/api/users/${user.id}/quota`}
              resource={user}
            />
          )}
          {displayImpersonateUser && (
            <ImpersonateUser
              successCallback={() => {
                successCallback();
                setTimeout(() => (window.location = "/"), 1000);
              }}
              user={user}
            />
          )}
          {filteredActions.map((actionItem) => (
            <Button
              key={actionItem.key}
              onClick={() => this.handleAction(actionItem.key)}
              disabled={loading}
              loading={loading}
              icon
              fluid
              basic
              labelPosition="left"
            >
              <Icon name={actionItem.icon} />
              {i18next.t(actionItem.label)}
            </Button>
          ))}
        </>
      );
    };

    return (
      <div>
        {useDropdown ? (
          <Dropdown
            text="Actions"
            icon="filter"
            floating
            labeled
            button
            className="icon"
          >
            <Dropdown.Menu>{generateActions()}</Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button.Group basic widths={5} compact className="margined">
            {generateActions()}
          </Button.Group>
        )}
      </div>
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
  displayImpersonateUser: PropTypes.bool,
  displayQuota: PropTypes.bool,
  useDropdown: PropTypes.bool,
};

UserActions.defaultProps = {
  displayBlock: false,
  displaySuspend: false,
  displayApprove: false,
  displayRestore: false,
  displayImpersonateUser: false,
  displayQuota: false,
  useDropdown: false,
};
