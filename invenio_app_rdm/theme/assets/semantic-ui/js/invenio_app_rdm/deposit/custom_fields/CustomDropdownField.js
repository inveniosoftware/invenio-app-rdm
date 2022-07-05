import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, SelectField } from "react-invenio-forms";
import _get from 'lodash/get';

export default class CustomDropdownField extends Component {

  serializeOptions = options => options?.map(
    option => ({text: option.title_l10n, value: option.id, key:option.id}))

  render() {
    const { description, placeholder, fieldPath, label, icon, options, search, multiple } = this.props;
    return (
      <>
      <SelectField
        fieldPath={fieldPath}
        label={
          <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
        }
        clearable
        options={this.serializeOptions(options)}
        search={search}
        multiple={multiple}
        optimized
        placeholder={placeholder}
      />
      {description && <label className="helptext">{description}</label>}
      </>
    );
  }
}
