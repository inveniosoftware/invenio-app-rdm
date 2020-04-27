import _join from "lodash/join";

export class DepositErrorHandler {
  extractErrors(response) {
    const backendErrors = response.errors;
    let frontendErrors = {};
    for (const fieldError of backendErrors) {
      const errorPath = _join([...fieldError.parents, fieldError.field], ".");
      frontendErrors[errorPath] = fieldError.message;
    }
    return frontendErrors;
  }
}
