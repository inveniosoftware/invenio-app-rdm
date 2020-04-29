// This file is part of React-Invenio-Forms
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik } from "formik";
import { Form, Button, Container } from "semantic-ui-react";

export class BaseForm extends Component {
  render() {
    const { formik } = this.props;
    return (
      <Container>
        <Formik onSubmit={this.props.onSubmit} {...formik}>
          <Form>{this.props.children}</Form>
        </Formik>
      </Container>
    );
  }
}

BaseForm.propTypes = {
  successCallback: PropTypes.func,
  submitSerializer: PropTypes.func,
  formik: PropTypes.shape({
    initialValues: PropTypes.object.isRequired,
    validationSchema: PropTypes.object,
    validate: PropTypes.func,
  }),
};
