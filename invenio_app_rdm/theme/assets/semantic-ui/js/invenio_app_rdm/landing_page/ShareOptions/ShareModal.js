// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import {
  Icon,
  Modal,
  Tab,
  Container,
  Button,
  MenuItem,
  Label,
} from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { LinksTab } from "./AccessLinks/LinksTab";
import { AccessRequestsTab } from "./AccessRequests/AccessRequestsTab";
import { PeopleTab } from "./AccessUsersGroups/PeopleTab";
import { GroupsTab } from "./AccessUsersGroups/GroupsTab";

export class ShareModal extends Component {
  constructor(props) {
    super(props);
    const { record } = this.props;
    this.state = {
      record: record,
      usersResults: undefined,
      groupsResults: undefined,
      linksResults: undefined,
      activeTabKey: "",
    };
  }

  updateGroupsState = (results, isDataChanged) => {
    this.setState({ groupsResults: results });

    if (isDataChanged) {
      const { record } = this.state;
      const updatedRecord = record?.parent?.access?.grants
        ?.filter((grant) => grant?.subject?.type !== "role")
        .concat(results);

      record.parent.access.grants = updatedRecord;

      this.setState({ record: record });
    }
  };

  updateUsersState = (results, isDataChanged) => {
    this.setState({ usersResults: results });

    if (isDataChanged) {
      const { record } = this.state;
      const updatedRecord = record?.parent?.access?.grants
        ?.filter((grant) => grant?.subject?.type !== "user")
        .concat(results);
      record.parent.access.grants = updatedRecord;

      this.setState({ record: record });
    }
  };

  updateLinksState = (results, isDataChanged) => {
    this.setState({ linksResults: results });

    if (isDataChanged) {
      const { record } = this.state;
      record.parent.access.links = results;
      this.setState({ record: record });
    }
  };

  handleTabChange = (e, data) => {
    const tabIndex = data.activeIndex;
    this.setState({ activeTabKey: data?.panes[tabIndex]?.menuItem?.key });
  };

  handleRecordUpdate = (updatedRecord) => {
    const { record } = this.state;
    updatedRecord.expanded = record.expanded;
    this.setState({ record: updatedRecord });
  };

  panes = (record, permissions) => {
    const { handleClose, groupsEnabled } = this.props;
    const { linksResults, groupsResults, usersResults } = this.state;

    let numUsers = 0;
    let numGroups = 0;
    record.parent?.access?.grants?.forEach((grant) => {
      if (grant.subject.type === "user") numUsers++;
      if (grant.subject.type === "role") numGroups++;
    });
    if (record?.expanded?.parent?.access?.owned_by) numUsers++;

    const panes = [
      {
        menuItem: (
          <MenuItem key="accessUsers">
            <Icon name="user" />
            {i18next.t("People")}
            <Label size="tiny">{numUsers}</Label>
          </MenuItem>
        ),
        render: () => (
          <Tab.Pane key="accessUsers" as={Container}>
            <PeopleTab
              record={record}
              permissions={permissions}
              results={usersResults}
              updateUsersState={this.updateUsersState}
            />
          </Tab.Pane>
        ),
      },
    ];

    if (groupsEnabled) {
      panes.push({
        menuItem: (
          <MenuItem key="accessGroups">
            <Icon name="users" />
            {i18next.t("Groups")}
            <Label size="tiny">{numGroups}</Label>
          </MenuItem>
        ),
        render: () => (
          <Tab.Pane key="accessGroups" as={Container}>
            <GroupsTab
              record={record}
              permissions={permissions}
              results={groupsResults}
              updateGroupsState={this.updateGroupsState}
            />
          </Tab.Pane>
        ),
      });
    }

    let numLinks = 0;
    record.parent?.access?.links?.forEach((link) => {
      if (link.id !== null) numLinks++;
    });

    panes.push(
      {
        menuItem: (
          <MenuItem key="accessLinks">
            <Icon name="linkify" />
            {i18next.t("Links")}
            <Label size="tiny">{numLinks}</Label>
          </MenuItem>
        ),
        render: () => (
          <Tab.Pane key="accessLinks" as={Container}>
            <LinksTab
              results={linksResults}
              record={record}
              updateLinksState={this.updateLinksState}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: (
          <MenuItem key="accessRequests">
            <Icon name="cog" />
            {i18next.t("Settings")}
          </MenuItem>
        ),
        render: () => (
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
    const { open, handleClose, permissions } = this.props;
    const { record, activeTabKey } = this.state;
    const shouldShowCloseButton = activeTabKey !== "accessRequests";
    return (
      <Modal
        open={open}
        closeIcon
        onClose={handleClose}
        className="record-share-modal"
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
          panes={this.panes(record, permissions)}
          onTabChange={this.handleTabChange}
        />
        {shouldShowCloseButton && (
          <Modal.Actions className="ui clearing segment">
            <Button
              size="small"
              onClick={handleClose}
              content={i18next.t("Close")}
              className="left floated clearing"
            />
          </Modal.Actions>
        )}
      </Modal>
    );
  }
}

ShareModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
};
