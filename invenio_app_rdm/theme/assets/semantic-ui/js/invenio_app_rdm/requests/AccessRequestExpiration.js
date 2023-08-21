import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SelectField } from "react-invenio-forms";

export class AccessRequestExpirationSelect extends Component {
  constructor(props) {
    super(props);
    const { expirationOptions } = props;
    this.expirationOptions = expirationOptions;
  }

  handleOnChange = ({ data, formikProps }) => {
    formikProps.form.setFieldValue("secret_link_expiration", data.value);
  };

  render() {
    const { inline, expirationOptions, value } = this.props;
    const expirationSetting = value ? value.toString() : expirationOptions[0].value;
    return (
      <SelectField
        label={i18next.t("Link expiration")}
        inline={inline}
        fieldPath="secret_link_expiration"
        options={this.expirationOptions}
        onChange={this.handleOnChange}
        value={expirationSetting}
        defaultValue={expirationOptions[0]}
      />
    );
  }
}

AccessRequestExpirationSelect.propTypes = {
  expirationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  inline: PropTypes.bool,
  value: PropTypes.string,
};

AccessRequestExpirationSelect.defaultProps = {
  expirationOptions: [
    { key: 0, text: i18next.t("Never"), value: "0" },
    { key: 30, text: i18next.t("In 1 month"), value: "30" },
    { key: 60, text: i18next.t("In 2 months"), value: "60" },
    { key: 180, text: i18next.t("In 6 months"), value: "180" },
    { key: 365, text: i18next.t("In 1 year"), value: "365" },
  ],
  inline: false,
  value: undefined,
};
