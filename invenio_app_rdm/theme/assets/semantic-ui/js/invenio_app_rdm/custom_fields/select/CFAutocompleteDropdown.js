import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, RemoteSelectField } from "react-invenio-forms";
import _get from "lodash/get";
import _isArray from "lodash/isArray";
import { Field } from "formik";

export default class CFAutocompleteDropdown extends Component {
  render() {
    const {
      description,
      fieldPath,
      required,
      label,
      icon,
      clearable,
      placeholder,
      multiple,
      autocomleteFrom,
    } = this.props;
    return (
      <>
        <FieldLabel htmlFor={fieldPath} icon={icon} label={label} />
        <Field name={fieldPath}>
          {({ form: { values } }) => {
            return (
              <RemoteSelectField
                clearable={clearable}
                required={required}
                fieldPath={fieldPath}
                multiple={multiple}
                noQueryMessage={placeholder}
                placeholder={placeholder}
                suggestionAPIUrl={autocomleteFrom}
                suggestionAPIHeaders={{
                  Accept: "application/vnd.inveniordm.v1+json",
                }}
                serializeSuggestions={(suggestions) => {
                  return _isArray(suggestions)
                    ? suggestions.map((item) => ({
                        text: item.title_l10n,
                        value: item.id,
                        key: item.id,
                      }))
                    : [
                        {
                          text: suggestions.title_l10n,
                          value: suggestions.id,
                          key: suggestions.id,
                        },
                      ];
                }}
                initialSuggestions={_get(values, `ui.${fieldPath}`, [])}
              />
            );
          }}
        </Field>
        {description && <label className="helptext">{description}</label>}
      </>
    );
  }
}

CFAutocompleteDropdown.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  autocomleteFrom: PropTypes.string.isRequired,
  icon: PropTypes.string,
  clearable: PropTypes.bool,
  multiple: PropTypes.bool,
  required: PropTypes.bool,
};

CFAutocompleteDropdown.defaultProps = {
  icon: undefined,
  clearable: false,
  multiple: false,
  required: false,
};
