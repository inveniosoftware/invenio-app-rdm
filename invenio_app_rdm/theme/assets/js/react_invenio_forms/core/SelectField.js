// This file is part of React-Invenio-Forms
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { FastField, Field, getIn } from "formik";
import { Form } from "semantic-ui-react";
import isEmpty from "lodash/isEmpty";

export class SelectField extends Component {
  renderError = (errors, name, value, direction = "above") => {
    let error = null;
    if (!Array.isArray(value)) {
      const options = this.props.options;
      if (
        !isEmpty(options) &&
        !options.find((o) => o.value === value) &&
        !isEmpty(value)
      ) {
        error = `The current value "${value}" is invalid, please select another value.`;
      }
    }

    if (!error) {
      error = errors[name];
    }
    return error
      ? {
          content: error,
          pointing: direction,
        }
      : null;
  };

  getAllOptions = (options, values) => {
    if (!Array.isArray(values)) {
      values = [values];
    }
    if (!this.props.required) {
      options = [
        {
          key: "",
          value: "",
          text: "-",
        },
        ...options,
      ];
    }
    if (!this.props.loading) {
      for (const value of values) {
        if (!isEmpty(value) && !options.find((o) => o.value === value)) {
          options.push({
            key: value,
            value: value,
            text: `Missing value: ${value}`,
            error: undefined, // set the key so we can check it in renderLabel
          });
        }
      }
    }
    return options;
  };

  renderLabel = (item, index, defaultLabelProps) => {
    if (!this.props.loading && "error" in item) {
      defaultLabelProps.className = "error";
    }
    return item.text;
  };

  renderFormField = (props) => {
    const {
      form: { values, setFieldValue, handleBlur, errors },
    } = props;
    const {
      defaultValue,
      error,
      fieldPath,
      label,
      loading,
      multiple,
      optimized,
      options,
      ...uiProps
    } = this.props;
    const value = getIn(values, fieldPath, multiple ? [] : defaultValue);
    return (
      <Form.Dropdown
        fluid
        selection
        error={error || this.renderError(errors, fieldPath, value)}
        id={fieldPath}
        label={{ children: label, htmlFor: fieldPath}}
        loading={loading}
        multiple={multiple}
        name={fieldPath}
        onBlur={handleBlur}
        onChange={(event, data) => {
          setFieldValue(fieldPath, data.value);
        }}
        options={this.getAllOptions(options, value)}
        renderLabel={this.renderLabel}
        searchInput={{ id: fieldPath }}
        value={value}
        {...uiProps}
      />
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

SelectField.propTypes = {
  defaultValue: PropTypes.string,
  error: PropTypes.object,
  fieldPath: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  multiple: PropTypes.bool,
  optimized: PropTypes.bool,
};

SelectField.defaultProps = {
  defaultValue: "",
  multiple: false,
  optimized: false,
};
