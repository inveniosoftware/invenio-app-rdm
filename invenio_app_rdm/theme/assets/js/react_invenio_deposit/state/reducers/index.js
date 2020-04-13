import { combineReducers } from "redux";

import depositReducer from "./deposit";

export default combineReducers({
  deposit: depositReducer,
});
