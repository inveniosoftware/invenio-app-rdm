// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { combineReducers } from "redux";

import depositReducer from "./deposit";

export default combineReducers({
  deposit: depositReducer,
});
