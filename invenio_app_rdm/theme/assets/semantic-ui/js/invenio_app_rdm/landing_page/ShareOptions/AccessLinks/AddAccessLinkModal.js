/*
 * SPDX-FileCopyrightText: 2026 CERN.
 * SPDX-License-Identifier: MIT
 */

import React, { Component } from "react";
import { Button, Modal, Table } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { CreateAccessLink } from "./CreateAccessLink";

export class AddAccessLinkModal extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpenModal = () => this.setState({ open: true });
  handleCloseModal = () => this.setState({ open: false });

  handleCreationAndClose = async (permission, expiresAt, description) => {
    const { handleCreation } = this.props;
    const success = await handleCreation(permission, expiresAt, description);
    if (success) {
      this.handleCloseModal();
    }
  };

  render() {
    const {
      record,
      hasLinkExpirationError,
      loading,
      dropdownOptions,
      isAccessLinksExpirationRequired,
      isComputer,
    } = this.props;
    const { open } = this.state;
    const addButtonText = i18next.t("Create link");

    return (
      <Modal
        role="dialog"
        closeIcon
        onClose={this.handleCloseModal}
        onOpen={this.handleOpenModal}
        closeOnDimmerClick={false}
        open={open}
        aria-label={addButtonText}
        trigger={
          <Button
            className={!isComputer ? "mobile only tablet only mb-15" : ""}
            content={addButtonText}
            positive
            size="medium"
            icon="plus"
            labelPosition="left"
            floated={!isComputer ? "right" : undefined}
          />
        }
      >
        <Modal.Header as="h2">{addButtonText}</Modal.Header>
        <Modal.Content>
          <Table>
            <Table.Body>
              <CreateAccessLink
                hasLinkExpirationError={hasLinkExpirationError}
                handleCreation={this.handleCreationAndClose}
                loading={loading}
                record={record}
                dropdownOptions={dropdownOptions}
                isAccessLinksExpirationRequired={isAccessLinksExpirationRequired}
              />
            </Table.Body>
          </Table>
        </Modal.Content>
      </Modal>
    );
  }
}

AddAccessLinkModal.propTypes = {
  record: PropTypes.object.isRequired,
  hasLinkExpirationError: PropTypes.bool.isRequired,
  handleCreation: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  dropdownOptions: PropTypes.array.isRequired,
  isAccessLinksExpirationRequired: PropTypes.bool.isRequired,
  isComputer: PropTypes.bool.isRequired,
};
