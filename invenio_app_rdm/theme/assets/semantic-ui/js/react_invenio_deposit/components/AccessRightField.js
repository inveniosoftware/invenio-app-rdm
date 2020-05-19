// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import React, { Component } from "react";
import PropTypes from "prop-types";

import { FieldLabel, RadioField } from "../../react_invenio_forms";


export class AccessRightField extends Component {
  /** Top-level Access Right Component */
  constructor(props) {
    super(props);
    this.state = {
      selected: null
    }
  }

  handleChange = (e, { value }) => {
    this.setState({selected: value});
  }

  render() {
    const { fieldPath, label, labelIcon, options } = this.props;

    return (
      <>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        {options.map((option) => (
          <RadioField
            fieldPath={fieldPath}
            label={option.text}
            labelIcon={option.icon}
            key={option.value}
            value={option.value}
            checked={this.state.selected === option.value}
            onChange={this.handleChange}
          />
        ))}
      </>
    );
  }
}

AccessRightField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelIcon: PropTypes.string,
  options: PropTypes.array
};
