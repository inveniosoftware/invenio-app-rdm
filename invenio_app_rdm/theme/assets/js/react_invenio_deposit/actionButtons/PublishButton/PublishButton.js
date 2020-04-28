import React, { Component } from "react";
import PropTypes from "prop-types";
import { Container, Icon, Button, Modal, Header } from "semantic-ui-react";
import { ActionButton } from "../../../react_invenio_forms";

export default class PublishButton extends Component {
  state = { confirmOpen: false };

  onPublishClick = (event, formik) => {
    this.setState({ confirmOpen: false }, () =>
      this.props.publichClick(event, formik)
    );
  };

  isDisabled = (formik) => {
    return formik.isSubmitting;
  };

  confirmPublish = () => this.setState({ confirmOpen: true });

  handleClose = () => this.setState({ confirmOpen: false });

  render() {
    return (
      <>
        <ActionButton
          isDisabled={this.isDisabled}
          name="publish"
          onClick={this.confirmPublish}
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
        {this.state.confirmOpen && (
          <Modal
            open={this.state.confirmOpen}
            onClose={this.handleClose}
            size="small"
          >
            <Modal.Content>
              <h3>Are you sure you want to publish this record?</h3>
            </Modal.Content>
            <Modal.Actions>
              <Button secondary onClick={this.handleClose}>
                Cancel
              </Button>
              <ActionButton
                name="publish"
                onClick={this.onPublishClick}
                primary
                content="Publish"
              />
            </Modal.Actions>
          </Modal>
        )}
      </>
    );
  }
}

PublishButton.propTypes = {};
