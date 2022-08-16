import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, RichInputField } from "react-invenio-forms";

export default class CustomRichInput extends Component {

  render() {
    const { fieldPath, required, label, icon, description, editorConfig } = this.props;
    return (
      <>
        <RichInputField
          key={fieldPath}
          fieldPath={fieldPath}
          required={required}
          editorConfig={editorConfig}
          label={<FieldLabel htmlFor={fieldPath} icon={icon} label={label} />}
        />
        {description && <label className="helptext">{description}</label>}
      </>
    );
  }
}

CustomRichInput.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  editorConfig: PropTypes.object,
  icon: PropTypes.string,
  required: PropTypes.bool
};

CustomRichInput.defaultProps = {
  icon: undefined,
  editorConfig: {},
  required: false
};
