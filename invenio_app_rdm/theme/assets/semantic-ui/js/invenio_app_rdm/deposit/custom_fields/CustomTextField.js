import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, TextField } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export default class CustomTextField extends Component {
  render() {
    const { key, fieldPath, label, icon, placeholder, description } =
      this.props;

    return (
      <TextField
        key={key}
        fieldPath={fieldPath}
        helpText={description}
        label={<FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
        placeholder={placeholder}
      />
    );
  }
}


CustomTextField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  description: PropTypes.string,
};

CustomTextField.defaultProps = {
  label: '',
  icon: undefined,
  placeholder: '',
  description: ''
};
