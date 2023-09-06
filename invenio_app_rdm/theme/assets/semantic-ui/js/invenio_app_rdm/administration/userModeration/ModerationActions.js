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
import { Button } from "semantic-ui-react";
import { InvenioAdministrationActionsApi as adminAPI } from "@js/invenio_administration";
import { NotificationContext } from "@js/invenio_administration";
import { withCancel } from "react-invenio-forms";

export class ModerationActions extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, actionSuccess: undefined, error: undefined };
  }

  static contextType = NotificationContext;

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  handleActionClick = async (e, actionKey, actionConfig) => {
    this.setState({ loading: true });
    const { resource, user, successCallback } = this.props;
    const { addNotification } = this.context;

    const name = user.profile.full_name || user.profile.email || user.profile.username;

    const links = resource.links.actions;
    const actionUrl = links[actionKey];
    // Execute action
    try {
      if (actionUrl) {
        this.cancellableAction = withCancel(adminAPI.resourceAction(actionUrl, {}));
        const result = await this.cancellableAction.promise;
        if (actionKey === "accept") {
          addNotification({
            title: "Success",
            content: `User ${name} was approved.`,
            type: "success",
          });
        } else if (actionKey === "decline") {
          addNotification({
            title: "Success",
            content: `User ${name} is blocked.`,
            type: "success",
          });
        }
      }
      this.setState({ loading: false, actionSuccess: true });
      successCallback();
    } catch (e) {
      this.setState({ actionSuccess: undefined });
      addNotification({
        title: "Error",
        content: e.toString(),
        type: "error",
      });
      console.error(e);
      this.setState({ loading: false });
    }
  };

  render() {
    const { actions } = this.props;
    const { loading } = this.state;
    return (
      <>
        {Object.entries(actions).map(([actionKey, actionConfig]) => {
          return (
            <Button
              key={actionKey}
              onClick={(e) => this.handleActionClick(e, actionKey, actionConfig)}
              disabled={loading}
              loading={loading}
            >
              {actionConfig.text}
            </Button>
          );
        })}
      </>
    );
  }
}

ModerationActions.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

ModerationActions.defaultProps = {};
