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
