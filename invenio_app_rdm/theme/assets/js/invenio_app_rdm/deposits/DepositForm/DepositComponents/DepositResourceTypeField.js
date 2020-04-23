import { getIn, Field } from 'formik';
import { SelectField } from "invenio-forms";
import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';


export class DepositResourceTypeField extends Component {
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
      formikBag.form.setFieldValue(
        resource_subtype_fieldpath,
        null
      );
    }

    return (
      <Form.Field>
        <SelectField
          fieldPath={resource_type_fieldpath}
          label={this.props.label}
          options={this.props.options.type}
          onChange={handleChange}
          placeholder='Select general resource type'
        />
        <SelectField
          fieldPath={resource_subtype_fieldpath}
          placeholder='Select resource subtype'
          options={
            this.props.options.subtype.filter(
              (e) => e['parent-value'] === resource_type
            )
          }
        />
      </Form.Field>
    );
  }

  render() {
    return (
      <Field name={this.props.fieldPath} component={this.renderResourceTypeField} />
    );
  }

}
