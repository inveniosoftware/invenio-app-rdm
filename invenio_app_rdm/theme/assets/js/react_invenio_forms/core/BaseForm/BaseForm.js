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
          {({ isSubmitting, handleSubmit }) => (
            <Form loading={isSubmitting}>{this.props.children}</Form>
          )}
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
