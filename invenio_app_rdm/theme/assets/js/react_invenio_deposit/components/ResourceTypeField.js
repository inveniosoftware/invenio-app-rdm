// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, Field } from "formik";

import { SelectField } from "../../react_invenio_forms";

export class ResourceTypeField extends Component {
  renderResourceTypeField = (formikBag) => {
    const resource_type_fieldpath = `${this.props.fieldPath}.type`;
    const resource_subtype_fieldpath = `${this.props.fieldPath}.subtype`;

    const resource_type = getIn(
      formikBag.form.values,
      resource_type_fieldpath,
      ""
    );

    const handleChange = (event, selectedOption) => {
      formikBag.form.setFieldValue(
        resource_type_fieldpath,
        selectedOption.value
      );
      formikBag.form.setFieldValue(resource_subtype_fieldpath, "");
    };

    const subtype_options = this.props.options.subtype.filter(
      (e) => e["parent-value"] === resource_type
    );
    return (
      <div>
        <SelectField
          fieldPath={resource_type_fieldpath}
          label={this.props.label}
          options={this.props.options.type}
          onChange={handleChange}
          placeholder="Select general resource type"
        />
        {subtype_options.length > 0 ? (
          <SelectField
            fieldPath={resource_subtype_fieldpath}
            placeholder="Select resource subtype"
            options={subtype_options}
          />
        ) : null}
      </div>
    );
  };

  render() {
    return (
      <Field
        name={this.props.fieldPath}
        component={this.renderResourceTypeField}
      />
    );
  }
}

ResourceTypeField.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  fieldPath: PropTypes.string.isRequired,
  options: PropTypes.shape({
    type: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string,
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    subtype: PropTypes.arrayOf(
      PropTypes.shape({
        "parent-text": PropTypes.string,
        "parent-value": PropTypes.string,
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }).isRequired,
};
