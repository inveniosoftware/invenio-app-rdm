import React, { Component } from "react";
import PropTypes from "prop-types";
import { BaseForm } from "../../react_invenio_forms";
import { Container } from "semantic-ui-react";

export default class DepositBootstrap extends Component {
  onSubmit = async (values, formikBag) => {
    switch (this.props.formAction) {
      case "save":
        this.props.save(values, formikBag);
        break;
      case "publish":
        this.props.publish(values, formikBag);
        break;
      default:
        console.log("onSubmit triggered some other way");
    }
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
