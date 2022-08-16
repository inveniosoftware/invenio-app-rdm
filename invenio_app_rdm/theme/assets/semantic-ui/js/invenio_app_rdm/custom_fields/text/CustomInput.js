import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, TextField } from "react-invenio-forms";

export default class CustomInput extends Component {

  render() {
    const { fieldPath, required, label, icon, placeholder, description } =
      this.props;

    return (
      <TextField
        key={fieldPath}
        fieldPath={fieldPath}
        required={required}
        helpText={description}
        label={<FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
        placeholder={placeholder}
      />
    );
  }
}

CustomInput.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string,
  required: PropTypes.bool,
};

CustomInput.defaultProps = {
  icon: undefined,
  required: false,
};
