import { getIn, Field } from 'formik';
import React, { Component } from 'react';

import { GroupField, SelectField } from "../../../../react_invenio_forms";

export class ResourceTypeField extends Component {
  // NOTE: We use formik.form.values as the state for field components

  renderResourceTypeField = (formikBag) => {
    const resource_type_fieldpath = `${this.props.fieldPath}.type`;
    const resource_subtype_fieldpath = `${this.props.fieldPath}.subtype`;

    const resource_type = getIn(
      formikBag.form.values,
      resource_type_fieldpath,
      ''

    );

    const handleChange = (event, selectedOption) => {
      formikBag.form.setFieldValue(
        resource_type_fieldpath,
        selectedOption.value
      );
      formikBag.form.setFieldValue(resource_subtype_fieldpath, '');
    }

    const subtype_options = this.props.options.subtype.filter(
      (e) => e['parent-value'] === resource_type
    )

    return (
      <div>
        <SelectField
          fieldPath={resource_type_fieldpath}
          label={this.props.label}
          options={this.props.options.type}
          onChange={handleChange}
          placeholder='Select general resource type'
        />
        {subtype_options.length > 0 ?
          <SelectField
            fieldPath={resource_subtype_fieldpath}
            placeholder='Select resource subtype'
            options={subtype_options}
          />
          : null}
      </div>
    );
  }

  render() {
    return (
      <Field name={this.props.fieldPath} component={this.renderResourceTypeField} />
    );
  }

}
