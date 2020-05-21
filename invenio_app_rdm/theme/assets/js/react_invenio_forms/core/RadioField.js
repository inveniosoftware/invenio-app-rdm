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

import { FieldLabel } from "../../react_invenio_forms";

export class RadioField extends Component {
  /** Radio Formik wrapper Component */

  renderFormField = ({ field, form }) => {
    /** Radio Formik + Semantic-UI Field Component
    *
    * NOTE: renderFormField is run multiple times
    * TODO: might gain performance by extracting it out as own component and
    *       using class methods
    *
    * field: current Formik field (RadioField instance)
    * form: current Formik form (holds formik state that drives the UI)
    */

    const {
      checked, fieldPath, label, labelIcon, onChange, optimized, value,
      ...uiProps
    } = this.props;

    const handleChange = (e, { value }) => {
      this.props.onChange(e, { value });
      form.setFieldValue(fieldPath, value);
    };

    return (
      <Form.Group inline>
        <Form.Radio
          name={fieldPath}
          label={<FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />}
          value={value}
          checked={checked}
          onChange={handleChange}
          {...uiProps}
        />
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

RadioField.propTypes = {
  checked: PropTypes.bool,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  optimized: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool
  ]),
};

RadioField.defaultProps = {
  checked: false,
  label: "",
  optimized: false,
};
