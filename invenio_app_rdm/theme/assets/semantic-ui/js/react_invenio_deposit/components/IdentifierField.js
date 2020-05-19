// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";

import { TextField } from "../../react_invenio_forms";

/**Identifier input component */
export class IdentifierField extends Component {
  render() {
    const {
      identifierFieldPath,
      schemeFieldPath,
    } = this.props;

    return (
      <>
        <TextField fieldPath={schemeFieldPath} label="Scheme" />
        <TextField fieldPath={identifierFieldPath} label="Identifier" />
      </>
    );
  }
}

IdentifierField.propTypes = {
  identifierFieldPath: PropTypes.string.isRequired,
  schemeFieldPath: PropTypes.string.isRequired,
  // TODO: Pass labels as props
};

IdentifierField.defaultProps = {
};
