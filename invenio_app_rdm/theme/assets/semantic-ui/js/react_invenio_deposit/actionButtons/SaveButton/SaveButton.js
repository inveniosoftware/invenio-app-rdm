// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "semantic-ui-react";
import { ActionButton } from "../../../react_invenio_forms";

export default class SaveButton extends Component {
  onSaveClick = (event, formik) => {
    this.props.saveClick(event, formik);
  };

  isDisabled = (formik) => {
    return formik.isSubmitting;
  };

  render() {
    return (
      <ActionButton
        isDisabled={this.isDisabled}
        name="save"
        onClick={this.onSaveClick}
        positive
      >
        {(formik) =>
          formik.isSubmitting && this.props.formAction == "save" ? (
            <>
              <Icon size="large" loading name="spinner" />
              Save draft
            </>
          ) : (
            "Save draft"
          )
        }
      </ActionButton>
    );
  }
}

SaveButton.propTypes = {};
