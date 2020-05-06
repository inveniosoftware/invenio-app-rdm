// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, Field } from "formik";
import { Form, Icon } from "semantic-ui-react";

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
        <label><Icon name={this.props.label_icon} />{this.props.label}</label>
        <SelectField
          fieldPath={resource_type_fieldpath}
          label={this.props.parent_label}
          options={this.props.options.type}
          onChange={handleChange}
          placeholder="Select general resource type"
        />
        {subtype_options.length > 0 ? (
          <SelectField
            fieldPath={resource_subtype_fieldpath}
            label={this.props.child_label}
            options={subtype_options}
            placeholder="Select resource subtype"
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
  child_label: PropTypes.string,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  label_icon: PropTypes.string,
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
  parent_label: PropTypes.string,

};
