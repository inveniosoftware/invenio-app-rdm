import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { configureStore } from "./store";
import { DepositBootstrap } from "./DepositBootstrap";
import { DepositController } from "./DepositController";
import { DepositApiClient } from "./DepositApiClient";
import { DepositErrorHandler } from "./DepositErrorHandler";

export class DepositFormApp extends Component {
  constructor(props) {
    super(props);

    const apiClient = props.apiClient
      ? props.apiClient
      : new DepositApiClient();
    const apiController = props.apiController
      ? props.apiController
      : new DepositController(apiClient);

    const apiErrorHandler = props.apiErrorHandler
      ? props.apiErrorHandler
      : new DepositErrorHandler();

    const appConfig = {
      config: props.config,
      record: props.record,
      apiController: apiController,
      apiErrorHandler: apiErrorHandler,
    };

    this.store = configureStore(appConfig);
  }

  render() {
    return (
      <Provider store={this.store}>
        <DepositBootstrap>{this.props.children}</DepositBootstrap>
      </Provider>
    );
  }
}

DepositFormApp.propTypes = {};
