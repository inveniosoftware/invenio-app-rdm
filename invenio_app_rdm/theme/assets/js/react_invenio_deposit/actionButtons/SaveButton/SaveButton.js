import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container } from "semantic-ui-react";
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
      <Container>
        <ActionButton
          isDisabled={this.isDisabled}
          name="save"
          onClick={this.onSaveClick}
        >
          {(formik) => (formik.isSubmitting ? "Submitting..." : "Save draft")}
        </ActionButton>
      </Container>
    );
  }
}

SaveButton.propTypes = {};
