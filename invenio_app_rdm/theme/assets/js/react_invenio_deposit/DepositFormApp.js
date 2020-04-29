// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { configureStore } from "./store";
import { DepositBootstrap } from "./DepositBootstrap";
import { DepositController } from "./DepositController";
import { DepositApiClient } from "./DepositApiClient";
import { DepositErrorHandler } from "./DepositErrorHandler";
import { DepositRecordSerializer } from "./DepositRecordSerializer";

export class DepositFormApp extends Component {
  constructor(props) {
    super(props);

    const apiClient = props.apiClient
      ? props.apiClient
      : new DepositApiClient();

    const controller = props.controller
      ? props.controller
      : new DepositController(apiClient);

    const apiErrorHandler = props.apiErrorHandler
      ? props.apiErrorHandler
      : new DepositErrorHandler();

    const recordSerializer = props.recordSerializer
      ? props.recordSerializer
      : new DepositRecordSerializer();

    const appConfig = {
      config: props.config,
      record: recordSerializer.serialize(props.record),
      controller: controller,
      recordSerializer: recordSerializer,
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
