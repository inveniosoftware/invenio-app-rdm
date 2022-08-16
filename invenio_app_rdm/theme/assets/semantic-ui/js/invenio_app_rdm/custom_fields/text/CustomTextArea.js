import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, TextAreaField } from "react-invenio-forms";

export default class CustomTextArea extends Component {

  render() {
    const { fieldPath, required, label, icon, placeholder, description } =
      this.props;

    return (
      <>
        <TextAreaField
          key={fieldPath}
          fieldPath={fieldPath}
          required={required}
          helpText={description}
          label={<FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
          placeholder={placeholder}
        />
        {description && <label className="helptext">{description}</label>}
      </>
    );
  }
}

CustomTextArea.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string,
  required: PropTypes.bool,
};

CustomTextArea.defaultProps = {
  icon: undefined,
  required: false,
};
