import React, { Component } from "react";
import PropTypes from "prop-types";
import { FastField, Field, getIn } from "formik";
import { Form } from "semantic-ui-react";

import { ErrorMessage } from "./ErrorMessage";

export class TextField extends Component {
  renderFormField = (props) => {
    const { fieldPath, optimized, ...uiProps } = this.props;
    const {
      form: { values, handleChange, handleBlur },
    } = props;

    return (
      <Form.Field id={fieldPath}>
        <Form.Input
          id={fieldPath}
          name={fieldPath}
          onChange={handleChange}
          onBlur={handleBlur}
          value={getIn(values, fieldPath, "")}
          {...uiProps}
        ></Form.Input>
        <ErrorMessage fieldPath={fieldPath} />
      </Form.Field>
    );
  };

  render() {
    const FormikField = this.props.optimized ? FastField : Field;

    return (
      <FormikField
        id={this.props.fieldPath}
        name={this.props.fieldPath}
        component={this.renderFormField}
      />
    );
  }
}

TextField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  optimized: PropTypes.bool,
};

TextField.defaultProps = {
  optimized: false,
};
