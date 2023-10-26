/*
 * This file is part of Invenio.
 * Copyright (C) 2022 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon } from "semantic-ui-react";
import { InvenioAdministrationActionsApi as adminAPI } from "@js/invenio_administration";
import { NotificationContext } from "@js/invenio_administration";
import { withCancel } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ModerationActions extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  static contextType = NotificationContext;

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
        await this.cancellableAction.promise;
        if (actionKey === "accept") {
          addNotification({
            title: i18next.t("Success"),
            content: i18next.t("User {{name}} was approved.", { name: name }),
            type: "success",
          });
        } else if (actionKey === "decline") {
          addNotification({
            title: i18next.t("Success"),
            content: i18next.t("User {{name}} is blocked.", { name: name }),
            type: "success",
          });
        }
      }
      this.setState({ loading: false });
      successCallback();
    } catch (e) {
      addNotification({
        title: i18next.t("Error"),
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
      <Button.Group className="margined" basic compact widths={2}>
        {Object.entries(actions).map(([actionKey, actionConfig]) => {
          const icon = actionKey === "accept" ? "check" : "ban";
          return (
            <Button
              key={actionKey}
              onClick={(e) => this.handleActionClick(e, actionKey, actionConfig)}
              disabled={loading}
              loading={loading}
              icon
              labelPosition="left"
            >
              <Icon name={icon} />
              {actionConfig.text}
            </Button>
          );
        })}
      </Button.Group>
    );
  }
}

ModerationActions.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  resource: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};

ModerationActions.defaultProps = {};
