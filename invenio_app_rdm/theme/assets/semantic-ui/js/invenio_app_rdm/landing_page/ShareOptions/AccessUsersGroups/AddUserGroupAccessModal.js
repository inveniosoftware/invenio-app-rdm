// This file is part of InvenioRDM
// Copyright (C) 2024-2024 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Button, Modal, Checkbox } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { SearchWithRoleSelection } from "@js/invenio_communities/members";
import { RichEditor } from "react-invenio-forms";
import { GrantAccessApi } from "../api/api";

export class AddUserGroupAccessModal extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, notifyUser: true, message: undefined };
  }

  onSuccess = () => {
    const { fetchData } = this.props;
    fetchData();
    this.handleCloseModal();
  };

  updateMessage = (message) => {
    this.setState({ message: message });
  };

  handleNotifyCheckboxClick = () => {
    const { notifyUser } = this.state;
    this.setState({ notifyUser: !notifyUser });
  };

  handleOpenModal = () => this.setState({ open: true });
  handleCloseModal = () => {
    this.setState({ open: false, notifyUser: true });
  };

  render() {
    const {
      results,
      record,
      isComputer,
      accessDropdownOptions,
      addButtonText,
      searchBarTitle,
      selectedItemsHeader,
      fetchMembers,
      searchType,
      searchBarTooltip,
      searchBarPlaceholder,
      doneButtonTipType,
    } = this.props;
    const { open, notifyUser, message } = this.state;

    const api = new GrantAccessApi(record);

    const existingIds = [record.parent?.access?.owned_by?.user];
    results.forEach((result) => {
      existingIds.push(result?.subject?.id);
    });

    return (
      <Modal
        role="dialog"
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
        <SearchWithRoleSelection
          key="access-users"
          roleOptions={accessDropdownOptions}
          modalClose={this.handleCloseModal}
          action={api.createGrants}
          fetchMembers={fetchMembers}
          onSuccessCallback={this.onSuccess}
          searchBarTitle={<label>{searchBarTitle}</label>}
          searchBarTooltip={searchBarTooltip}
          doneButtonText={i18next.t("Add")}
          doneButtonIcon="plus"
          radioLabel={i18next.t("Access")}
          selectedItemsHeader={selectedItemsHeader}
          message={message}
          searchType={searchType}
          messageComponent={
            <>
              <Checkbox
                checked={notifyUser}
                className="mb-20 mt-10"
                label={i18next.t("Notify people")}
                onClick={this.handleNotifyCheckboxClick}
              />
              {notifyUser && (
                <>
                  <p>
                    <b>{i18next.t("Invitation message")}</b>
                  </p>
                  <RichEditor
                    onBlur={(event, editor) => {
                      this.updateMessage(editor.getContent());
                    }}
                  />
                </>
              )}
            </>
          }
          notify={notifyUser}
          doneButtonTip={i18next.t("You are about to add")}
          doneButtonTipType={doneButtonTipType}
          existingEntities={existingIds}
          existingEntitiesDescription={i18next.t("Access already granted")}
          searchBarPlaceholder={searchBarPlaceholder}
        />
      </Modal>
    );
  }
}

AddUserGroupAccessModal.propTypes = {
  record: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  isComputer: PropTypes.bool.isRequired,
  accessDropdownOptions: PropTypes.array.isRequired,
  fetchData: PropTypes.func.isRequired,
  addButtonText: PropTypes.string,
  searchBarTitle: PropTypes.string,
  searchBarPlaceholder: PropTypes.string,
  searchBarTooltip: PropTypes.string,
  doneButtonTipType: PropTypes.string,
  selectedItemsHeader: PropTypes.string,
  fetchMembers: PropTypes.func.isRequired,
  searchType: PropTypes.oneOf(["group", "user"]).isRequired,
};

AddUserGroupAccessModal.defaultProps = {
  addButtonText: "",
  searchBarTitle: "",
  searchBarTooltip: "",
  selectedItemsHeader: "",
  searchBarPlaceholder: "",
  doneButtonTipType: "",
};
