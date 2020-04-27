import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Icon } from "semantic-ui-react";
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
      </Container>
    );
  }
}

SaveButton.propTypes = {};
