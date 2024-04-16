// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Icon, Modal, Tab, Container } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { LinksTab } from "./AccessLinks/LinksTab";
import { AccessRequestsTab } from "./AccessRequests/AccessRequestsTab";
import { AccessUsersGroups } from "./AccessUsersGroups/AccessUsersGroups";
import { GroupsApi } from "@js/invenio_communities/api";
// import { UsersApi } from "@js/invenio_communities/api"; uncomment together with the code below

export class ShareModal extends Component {
  constructor(props) {
    super(props);
    const { record } = this.props;
    this.state = {
      record: record,
    };
  }

  handleRecordUpdate = (updatedRecord) => {
    this.setState({ record: updatedRecord });
  };

  panes = (record, accessLinksSearchConfig, permissions) => {
    const { handleClose, groupsEnabled } = this.props;
    // const usersClient = new UsersApi(); uncomment together with the code below
    const groupsClient = new GroupsApi();
    const panes = [
      // hiding user access for until the groups tab is added and fully tested
      // {
      //   menuItem: { icon: "user", content: "People" },
      //   pane: (
      //     <Tab.Pane key="accessUsers" as={Container}>
      //       <AccessUsersGroups
      //         searchType="user"
      //         record={record}
      //         handleClose={handleClose}
      //         permissions={permissions}
      //         successCallback={this.handleRecordUpdate}
      //         endpoint={`${record.links.access_users}`}
      //         emptyResultText={i18next.t("No user has access to this record yet.")}
      //         tableHeaderText={i18next.t("People with access")}
      //         addButtonText={i18next.t("Add people")}
      //         searchBarTitle={i18next.t("User")}
      //         selectedItemsHeader={i18next.t("No selected users")}
      //         fetchMembers={usersClient.getUsers}
      //         searchBarTooltip={i18next.t(
      //           "Search for users to grant access (only users with a public profile can be invited)"
      //         )}
      //         searchBarPlaceholder={i18next.t("Search by email, full name or username")}
      //         doneButtonTipType={i18next.t("users")}
      //       />
      //     </Tab.Pane>
      //   ),
      // },
    ];
    if (groupsEnabled) {
      panes.push({
        menuItem: { icon: "users", content: "Groups" },
        pane: (
          <Tab.Pane key="accessGroups" as={Container}>
            <AccessUsersGroups
              searchType="group"
              record={record}
              handleClose={handleClose}
              permissions={permissions}
              successCallback={this.handleRecordUpdate}
              endpoint={`${record.links.access_groups}`}
              emptyResultText={i18next.t("No group has access to this record yet.")}
              tableHeaderText={i18next.t("Groups with access")}
              addButtonText={i18next.t("Add groups")}
              searchBarTitle={i18next.t("Group")}
              selectedItemsHeader={i18next.t("No selected groups")}
              fetchMembers={groupsClient.getGroups}
              searchBarPlaceholder={i18next.t("Search for groups")}
              doneButtonTipType={i18next.t("groups")}
            />
          </Tab.Pane>
        ),
      });
    }

    panes.push(
      {
        menuItem: { icon: "linkify", content: "Links" },
        pane: (
          <Tab.Pane key="accessLinks" as={Container}>
            <LinksTab
              record={record}
              accessLinksSearchConfig={accessLinksSearchConfig}
              handleClose={handleClose}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: { icon: "cog", content: "Access requests" },
        pane: (
          <Tab.Pane key="accessRequests" as={Container}>
            <AccessRequestsTab
              record={record}
              handleClose={handleClose}
              successCallback={this.handleRecordUpdate}
            />
          </Tab.Pane>
        ),
      }
    );

    return panes;
  };

  render() {
    const { open, handleClose, accessLinksSearchConfig, permissions } = this.props;
    const { record } = this.state;
    return (
      <Modal
        open={open}
        closeIcon
        onClose={handleClose}
        className="share-modal"
        role="dialog"
        aria-labelledby="access-link-modal-header"
        aria-modal="true"
        tab-index="-1"
        size="large"
        closeOnDimmerClick={false}
      >
        <Modal.Header as="h2" id="access-link-modal-header">
          <Icon name="share square" />
          {i18next.t("Share access")}
        </Modal.Header>

        <Tab
          menu={{ secondary: true, pointing: true }}
          panes={this.panes(record, accessLinksSearchConfig, permissions)}
          renderActiveOnly={false}
        />
      </Modal>
    );
  }
}

ShareModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  accessLinksSearchConfig: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
};
