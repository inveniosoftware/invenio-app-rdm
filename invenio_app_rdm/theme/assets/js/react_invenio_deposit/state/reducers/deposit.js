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
        record: action.payload,
      };
    case SAVE_SUCCESS:
      return {
        ...state,
        record: action.payload,
      };
    default:
      return state;
  }
};
