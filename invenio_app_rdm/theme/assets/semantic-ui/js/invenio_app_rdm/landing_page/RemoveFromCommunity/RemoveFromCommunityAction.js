// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Button, Modal, Message, Icon, Checkbox, Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Trans } from "react-i18next";
import { http, ErrorMessage } from "react-invenio-forms";
import PropTypes from "prop-types";

export class RemoveFromCommunityAction extends Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      modalOpen: false,
      loading: false,
      error: undefined,
      checkboxMembers: false,
      checkboxRecords: false,
      buttonDisabled: true,
    };
    this.state = this.INITIAL_STATE;
  }

  handleCheckboxChange = (e, { id, checked }) => {
    const { checkboxRecords, checkboxMembers } = this.state;

    if (id === "members-confirm") {
      this.setState({
        checkboxMembers: checked,
        buttonDisabled: !(checked && checkboxRecords),
      });
    }
    if (id === "records-confirm") {
      this.setState({
        checkboxRecords: checked,
        buttonDisabled: !(checkboxMembers && checked),
      });
    }
  };
  openConfirmModal = () => this.setState({ modalOpen: true });
  closeConfirmModal = () => this.setState(this.INITIAL_STATE);

  handleDelete = async () => {
    const { result, recordCommunityEndpoint, successCallback } = this.props;

    this.setState({ loading: true });
    const payload = {
      communities: [{ id: result.id }],
    };

    try {
      const response = await http.delete(recordCommunityEndpoint, {
        data: payload,
      });
      successCallback(response.data);
    } catch (e) {
      this.setState({ error: e, loading: false });
    }
    this.setState({ modalOpen: false });
  };

  render() {
    const {
      modalOpen,
      loading,
      error,
      checkboxMembers,
      checkboxRecords,
      buttonDisabled,
    } = this.state;
    const { result } = this.props;
    const communityTitle = result.metadata.title;

    return (
      <>
        <Button
          size="tiny"
          negative
          labelPosition="left"
          icon="trash"
          floated="right"
          onClick={this.openConfirmModal}
          content={i18next.t("Remove")}
        />
        <Modal size="tiny" dimmer="blurring" open={modalOpen}>
          <Modal.Header>{i18next.t("Remove community")}</Modal.Header>
          <Modal.Content>
            {i18next.t(
              "Are you sure you want to remove the record from the community?"
            )}
          </Modal.Content>
          <Modal.Content>
            <Message negative>
              <Message.Header>
                <Grid columns={2} verticalAlign="middle">
                  <Grid.Column width={1}>
                    <Icon name="warning sign" />
                  </Grid.Column>
                  <Grid.Column width={15}>
                    {i18next.t("I understand the consequences:")}
                  </Grid.Column>
                </Grid>
              </Message.Header>
              <Message.Content>
                <Checkbox
                  id="members-confirm"
                  label={
                    /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
                    <label>
                      <Trans>
                        Members of the community <b>"{{ communityTitle }}"</b> will{" "}
                        <u>lose their access</u> to the record.
                      </Trans>
                    </label>
                  }
                  checked={checkboxMembers}
                  onChange={this.handleCheckboxChange}
                />
                <Checkbox
                  id="records-confirm"
                  label={i18next.t(
                    "The record can only be re-included in the community by going through a new review by the community curators."
                  )}
                  checked={checkboxRecords}
                  onChange={this.handleCheckboxChange}
                />
              </Message.Content>
            </Message>
          </Modal.Content>

          <Modal.Actions>
            {error && (
              <ErrorMessage
                header={i18next.t("Something went wrong")}
                content={error.message}
                icon="exclamation"
                className="text-align-left"
                negative
              />
            )}
            <Button
              onClick={() => this.closeConfirmModal()}
              floated="left"
              disabled={loading}
              loading={loading}
            >
              {i18next.t("Cancel")}
            </Button>
            <Button
              disabled={buttonDisabled || loading}
              negative
              onClick={() => this.handleDelete()}
              loading={loading}
              icon="trash alternate outline"
              content={i18next.t("Remove")}
            />
          </Modal.Actions>
        </Modal>
      </>
    );
  }
}

RemoveFromCommunityAction.propTypes = {
  result: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};
