// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Button, Icon } from "semantic-ui-react";

import { TextField } from "../../react_invenio_forms";

import { IdentifierField } from "./IdentifierField";

/**Affiliation input component */
export class AffiliationField extends Component {
  render() {
    const {
      identifierFieldPath,
      nameFieldPath,
      schemeFieldPath,
    } = this.props;

    return (
      <>
        <TextField fieldPath={nameFieldPath} label="Name" />
        <IdentifierField
          identifierFieldPath={identifierFieldPath}
          schemeFieldPath={schemeFieldPath}
        />
      </>
    );
  }
}

AffiliationField.propTypes = {
  identifierFieldPath: PropTypes.string.isRequired,
  nameFieldPath: PropTypes.string.isRequired,
  schemeFieldPath: PropTypes.string.isRequired,
};

AffiliationField.defaultProps = {
};
