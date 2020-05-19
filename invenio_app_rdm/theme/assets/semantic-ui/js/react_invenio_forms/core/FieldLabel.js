// This file is part of React-Invenio-Forms
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "semantic-ui-react";

export class FieldLabel extends Component {
  render() {
    const {htmlFor, icon, label} = this.props;
    return (
      <label htmlFor={htmlFor}>{icon ? <Icon name={icon} /> : null}{label}</label>
    )
  }
}

FieldLabel.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
};
