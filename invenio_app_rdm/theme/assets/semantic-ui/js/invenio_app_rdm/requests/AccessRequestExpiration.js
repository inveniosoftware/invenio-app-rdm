/*
 * SPDX-FileCopyrightText: 2023-2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { SelectField } from "react-invenio-forms";

const DEFAULT_EXPIRATION_OPTIONS = [
  { key: 0, text: i18next.t("Never"), value: "0" },
  { key: 30, text: i18next.t("In 1 month"), value: "30" },
  { key: 60, text: i18next.t("In 2 months"), value: "60" },
  { key: 180, text: i18next.t("In 6 months"), value: "180" },
  { key: 365, text: i18next.t("In 1 year"), value: "365" },
];

export class AccessRequestExpirationSelect extends Component {
  handleOnChange = ({ data, formikProps }) => {
    formikProps.form.setFieldValue("secret_link_expiration", data.value);
  };

  render() {
    const {
      expirationOptions = DEFAULT_EXPIRATION_OPTIONS,
      inline = false,
      isAccessLinksExpirationRequired,
      value,
    } = this.props;
    const availableOptions = isAccessLinksExpirationRequired
      ? expirationOptions.filter((option) => option.value !== "0")
      : expirationOptions;
    const expirationSetting = value?.toString() || availableOptions[0]?.value;

    return (
      <SelectField
        label={i18next.t("Link expiration")}
        inline={inline}
        fieldPath="secret_link_expiration"
        options={availableOptions}
        onChange={this.handleOnChange}
        value={expirationSetting}
        defaultValue={availableOptions[0]?.value}
      />
    );
  }
}

AccessRequestExpirationSelect.propTypes = {
  expirationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  inline: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isAccessLinksExpirationRequired: PropTypes.bool.isRequired,
};
