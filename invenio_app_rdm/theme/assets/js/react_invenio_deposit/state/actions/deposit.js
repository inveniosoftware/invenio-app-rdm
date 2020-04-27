import {
  FORM_ACTION_EVENT_EMITTED,
  PUBLISH_SUCCESS,
  SAVE_SUCCESS,
} from "../types";

export const setFormErrorsFromResponse = (response, formik) => {
  return async (dispatch) => {
    const extractErrors = (error) => {
      let backendErrors = error.errors;
      let frontendErrors = {};
      for (const fieldError of backendErrors) {
        frontendErrors[fieldError.field] = fieldError.message;
      }
      return frontendErrors;
    };
    const extractedErrors = extractErrors(response);
    formik.setErrors(extractedErrors);
    dispatch({
      type: "FORM_ACTION_FAILED",
    });
  };
};

export const publish = (record, formik) => {
  return async (dispatch, getState, config) => {
    const controller = config.apiController;

    try {
      const response = await controller.publish(record);
      dispatch({
        type: PUBLISH_SUCCESS,
        payload: response,
      });
    } catch (error) {
      dispatch(setFormErrorsFromResponse(error, formik));
    }
  };
};

export const save = (record, formik) => {
  return async (dispatch, getState, config) => {
    const controller = config.apiController;
    try {
      const response = await controller.save(record);
      dispatch({
        type: SAVE_SUCCESS,
        payload: response,
      });
    } catch (error) {
      console.log("error");
      dispatch(setFormErrorsFromResponse(error, formik));
    }
  };
};

export const submitAction = (action, event, formik) => {
  return async (dispatch, getState, config) => {
    console.log(`onSubmit - ${action}`);
    dispatch({
      type: FORM_ACTION_EVENT_EMITTED,
      payload: action,
    });
    formik.handleSubmit(event);
  };
};
