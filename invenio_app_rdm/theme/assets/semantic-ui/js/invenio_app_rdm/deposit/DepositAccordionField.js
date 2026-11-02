/*
 * SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import { AccordionField } from "react-invenio-forms";

// Ignore empty placeholder rows emitted by the record schema.
export const hasFieldValue = (value) => {
  if (Array.isArray(value)) return value.some(hasFieldValue);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasFieldValue);
  }
  return value !== null && value !== undefined && value !== "";
};

export const isCustomSectionActive = (section, record, collapseEmptySections) =>
  section.fields.some(({ field }) => hasFieldValue(record.custom_fields?.[field])) ||
  (section.active ?? !collapseEmptySections);

// Apply the value safeguard after instance overrides select an active preference.
// AccordionField owns the mounted state, so rerenders do not reset manual toggles.
export const DepositAccordionField = ({ record, includesPaths, active, ...props }) => (
  <AccordionField
    {...props}
    includesPaths={includesPaths}
    active={includesPaths.some((path) => hasFieldValue(_get(record, path))) || active}
  />
);

DepositAccordionField.propTypes = {
  record: PropTypes.object.isRequired,
  includesPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
  active: PropTypes.bool,
};

DepositAccordionField.defaultProps = {
  active: true,
};
