import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FastField, Field, getIn } from 'formik';
import { Form } from 'semantic-ui-react';

export class BooleanField extends Component {
  renderError(errors, name, direction = 'left') {
    const error = errors[name];
    return error
      ? {
          content: error,
          pointing: direction,
        }
      : null;
  }

  renderFormField = props => {
    const { fieldPath, label, optimized, ...uiProps } = this.props;
    const {
      form: { values, handleBlur, errors, setFieldValue },
    } = props;
    const value = getIn(values, fieldPath, false);
    return (
      <Form.Group inline>
        <label htmlFor={fieldPath}>{label}</label>
        <Form.Checkbox
          id={fieldPath}
          name={fieldPath}
          onChange={() => setFieldValue(fieldPath, !value)}
          onBlur={handleBlur}
          checked={value}
          error={this.renderError(errors, fieldPath)}
          {...uiProps}
        ></Form.Checkbox>
      </Form.Group>
    );
  };
  render() {
    const FormikField = this.props.optimized ? FastField : Field;
    return (
      <FormikField
        name={this.props.fieldPath}
        component={this.renderFormField}
      />
    );
  }
}

BooleanField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  optimized: PropTypes.bool,
};

BooleanField.defaultProps = {
  label: '',
  optimized: false,
};
