import React, { Component } from 'react';
import { Form } from 'semantic-ui-react'
import { ErrorMessage } from "invenio-forms";
import PropTypes from "prop-types";
import { FastField, Field } from "formik";


export class DepositTextField extends Component {
  // This is inspired from TextField in invenio-forms
  // I removed the parts I didn't understand yet.
  // Maybe we can switch to TextField eventually or use this to change
  // TextField and then switch to it
  renderFormField = ({field, form}) => {
    console.log("field", field);
    console.log("form", form);

    const { name, optimized, ...uiProps } = this.props;

    // TODO: Allow to choose between text input and textarea
    const FormComponent = Form.Input;  // this.props.as === "input" ? Form.Input : Form.TextArea;

    // TODO: Re-instate if needed
    // const {
    //   form: { values, handleChange, handleBlur },
    // } = props;
    // {...uiProps }
    // id = { fieldPath }
    // name = { fieldPath }
    // onChange = { handleChange }
    // onBlur = { handleBlur }
    // value = { getIn(values, fieldPath, "") }

    return (
      <Form.Field id={name}>
        <FormComponent
          {...field}
        ></FormComponent>
        {/* Question: Why is fieldPath used and not name ? */}
        <ErrorMessage fieldPath={name} />
      </Form.Field>
    );
  };

  render() {
    const FormikField = this.props.optimized ? FastField : Field;
    return (
      <FormikField
        name={this.props.name}
        component={this.renderFormField}
      />
    );
  }
}

DepositTextField.propTypes = {
  name: PropTypes.string.isRequired,  // fieldPath
  optimized: PropTypes.bool,
  as: PropTypes.oneOf(["input", "textarea"]),
};

DepositTextField.defaultProps = {
  optimized: false,
  as: "input",
};
