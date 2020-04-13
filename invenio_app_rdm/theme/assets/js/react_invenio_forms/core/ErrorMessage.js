import React, { Component } from "react";
import PropTypes from "prop-types";
import { Message } from "semantic-ui-react";
import { Field } from "formik";

export class ErrorMessage extends Component {
  renderFormField = ({ form: { errors } }) => {
    return errors[this.props.fieldPath] ? (
      <Message negative content={errors[this.props.fieldPath]}></Message>
    ) : null;
  };

  render() {
    const { fieldPath } = this.props;
    return <Field name={fieldPath}>{this.renderFormField}</Field>;
  }
}

ErrorMessage.propTypes = {
  fieldPath: PropTypes.string.isRequired,
};
