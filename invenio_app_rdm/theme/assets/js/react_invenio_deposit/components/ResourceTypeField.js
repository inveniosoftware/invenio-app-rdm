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

import { FieldLabel } from "../../react_invenio_forms";
import { SelectField } from "../../react_invenio_forms";


export class ResourceTypeField extends Component {
  renderResourceTypeField = (formikBag) => {
    const typeFieldPath = `${this.props.fieldPath}.type`;
    const subtypeFieldPath = `${this.props.fieldPath}.subtype`;

    const resource_type = getIn(
      formikBag.form.values,
      typeFieldPath,
      ""
    );

    const handleChange = (event, selectedOption) => {
      formikBag.form.setFieldValue(
        typeFieldPath,
        selectedOption.value
      );
      formikBag.form.setFieldValue(subtypeFieldPath, "");
    };

    const subtypeOptions = this.props.options.subtype.filter(
      (e) => e["parent-value"] === resource_type
    );
    return (
      <div>
        <FieldLabel htmlFor={this.props.fieldPath} icon={this.props.labelIcon} label={this.props.label} />
        <SelectField
          fieldPath={typeFieldPath}
          label={this.props.typeLabel}
          options={this.props.options.type}
          onChange={handleChange}
          placeholder="Select general resource type"
        />
        {subtypeOptions.length > 0 ? (
          <SelectField
            fieldPath={subtypeFieldPath}
            label={this.props.subtypeLabel}
            options={subtypeOptions}
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
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
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
  subtypeLabel: PropTypes.string,
  typeLabel: PropTypes.string,
};
