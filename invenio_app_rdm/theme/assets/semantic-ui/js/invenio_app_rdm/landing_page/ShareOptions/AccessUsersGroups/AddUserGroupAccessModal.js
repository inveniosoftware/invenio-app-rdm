// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
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
import { UsersApi } from "@js/invenio_communities/api";
import { GroupsApi } from "@js/invenio_communities/api";

export class AddUserGroupAccessModal extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, notifyUser: true, message: undefined };
  }

  onSuccess = () => {
    const { onGrantAddedOrDeleted, endpoint, searchType } = this.props;
    onGrantAddedOrDeleted(`${endpoint}?expand=true`, searchType);
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

  searchEntities = () => {
    const { searchType } = this.props;
    if (searchType === "user") {
      const usersClient = new UsersApi();
      return usersClient.suggestUsers;
    }
    if (searchType === "role") {
      const groupsClient = new GroupsApi();
      return groupsClient.getGroups;
    }
  };

  render() {
    const { results, record, isComputer, accessDropdownOptions, searchType } =
      this.props;
    const { open, notifyUser, message } = this.state;

    const api = new GrantAccessApi(record);

    const existingIds = [record.parent?.access?.owned_by?.user];
    results.forEach((result) => {
      existingIds.push(result?.subject?.id);
    });

    let addButtonText = "";
    let searchBarTitle = "";
    let selectedItemsHeader = "";
    let searchBarTooltip = "";
    let searchBarPlaceholder = "";
    let doneButtonTipType = "";
    if (searchType === "user") {
      addButtonText = i18next.t("Add people");
      searchBarTitle = i18next.t("User");
      selectedItemsHeader = i18next.t("No selected users");
      searchBarTooltip = i18next.t(
        "Search for users to grant access (only users with a public profile can be invited)"
      );
      searchBarPlaceholder = i18next.t("Search by email, full name or username");
      doneButtonTipType = i18next.t("users");
    }
    if (searchType === "role") {
      addButtonText = i18next.t("Add groups");
      searchBarTitle = i18next.t("Group");
      selectedItemsHeader = i18next.t("No selected groups");
      searchBarPlaceholder = i18next.t("Search for groups");
      doneButtonTipType = i18next.t("groups");
    }

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
        <SearchWithRoleSelection
          key="access-users"
          roleOptions={accessDropdownOptions}
          modalClose={this.handleCloseModal}
          action={api.createGrants}
          fetchMembers={this.searchEntities()}
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
                    <b>{i18next.t("Notification message")}</b>
                  </p>
                  <RichEditor
                    inputValue={() => message} // () =>  Avoid re-rendering
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
  onGrantAddedOrDeleted: PropTypes.func.isRequired,
  endpoint: PropTypes.string.isRequired,
  searchType: PropTypes.oneOf(["group", "role", "user"]).isRequired,
};
