// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { BaseForm } from "../../react_invenio_forms";
import { Container } from "semantic-ui-react";

export default class DepositBootstrap extends Component {
  onSubmit = (values, formikBag) => {
    this.props.submitFormData(values, formikBag);
  };

  render() {
    return (
      <Container style={{ marginTop: "35px" }}>
        <BaseForm
          onSubmit={this.onSubmit}
          formik={{
            enableReinitialize: true,
            initialValues: this.props.record,
          }}
        >
          {this.props.children}
        </BaseForm>
      </Container>
    );
  }
}

DepositBootstrap.propTypes = {};
