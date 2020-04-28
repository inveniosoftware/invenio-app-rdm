// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  FORM_ACTION_EVENT_EMITTED,
  FORM_ACTION_FAILED,
  PUBLISH_SUCCESS,
  SAVE_SUCCESS,
} from "../types";

export default (state = {}, action) => {
  switch (action.type) {
    case FORM_ACTION_EVENT_EMITTED:
      return {
        ...state,
        formAction: action.payload,
      };
    case FORM_ACTION_FAILED:
      return {
        ...state,
        formAction: null,
      };
    case PUBLISH_SUCCESS:
      return {
        ...state,
        record: { ...state.record, ...action.payload.data },
        formAction: null,
      };
    case SAVE_SUCCESS:
      return {
        ...state,
        record: { ...state.record, ...action.payload.data },
        formAction: null,
      };
    default:
      return state;
  }
};
