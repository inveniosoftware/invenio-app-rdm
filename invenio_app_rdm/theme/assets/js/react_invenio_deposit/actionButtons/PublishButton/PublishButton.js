import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Icon } from "semantic-ui-react";
import { ActionButton } from "../../../react_invenio_forms";

export default class PublishButton extends Component {
  onPublishClick = (event, formik) => {
    this.props.publichClick(event, formik);
  };

  isDisabled = (formik) => {
    return formik.isSubmitting;
  };

  render() {
    return (
      <Container>
        <ActionButton
          isDisabled={this.isDisabled}
          name="publish"
          onClick={this.onPublishClick}
          primary
        >
          {(formik) =>
            formik.isSubmitting && this.props.formAction == "publish" ? (
              <>
                <Icon size="large" loading name="spinner" />
                Publish
              </>
            ) : (
              "Publish"
            )
          }
        </ActionButton>
      </Container>
    );
  }
}

PublishButton.propTypes = {};
