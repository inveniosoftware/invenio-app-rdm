// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import rootReducer from "./state/reducers";
import { INITIAL_STORE_STATE } from "./storeConfig";

export function configureStore(appConfig) {
  const { record, config, ...apiConfig } = appConfig;
  const initialDepositState = { record, config, ...INITIAL_STORE_STATE };
  const preloadedState = {
    deposit: initialDepositState,
  };

  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(thunk.withExtraArgument(apiConfig)))
  );
}
