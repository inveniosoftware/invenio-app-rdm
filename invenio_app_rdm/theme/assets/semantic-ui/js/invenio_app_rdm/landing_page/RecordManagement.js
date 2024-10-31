// This file is part of InvenioRDM
// Copyright (C) 2020-2024 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import { i18next } from "@translations/invenio_app_rdm/i18next";

import React, { Component } from "react";
import { Button, Grid, Icon, Message } from "semantic-ui-react";

import { EditButton } from "./EditButton";
import { ShareButton } from "./ShareOptions/ShareButton";
import { NewVersionButton } from "@js/invenio_rdm_records";
import PropTypes from "prop-types";
import Overridable from "react-overridable";
import { ManageButton } from "./ManageButton";

export class RecordManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
    };
  }

  render() {
    const {
      record,
      permissions,
      isDraft,
      isPreviewSubmissionRequest,
      currentUserId,
      recordOwnerID,
      groupsEnabled,
    } = this.props;
    const { error } = this.state;
    const { id: recid } = record;
    const handleError = (errorMessage) => {
      console.error(errorMessage);
      this.setState({ error: errorMessage });
    };

    return (
      <Grid columns={1} className="record-management">
        {permissions.can_moderate && (
          <Grid.Column className="pb-5">
            <ManageButton recid={recid} recordOwnerID={recordOwnerID} />
          </Grid.Column>
        )}
        {permissions.can_edit && !isDraft && (
          <Grid.Column className={permissions.can_manage ? "pb-5 pt-5" : "pb-5"}>
            <EditButton recid={recid} onError={handleError} />
          </Grid.Column>
        )}
        {isPreviewSubmissionRequest && isDraft && (
          <Grid.Column className="pb-20">
            <Button
              fluid
              className="warning"
              size="medium"
              onClick={() => (window.location = `/uploads/${recid}`)}
              icon
              labelPosition="left"
            >
              <Icon name="edit" />
              {i18next.t("Edit")}
            </Button>
          </Grid.Column>
        )}
        {!isPreviewSubmissionRequest && (
          <>
            <Grid.Column className="pt-5 pb-5">
              <NewVersionButton
                fluid
                size="medium"
                record={record}
                onError={handleError}
                disabled={!permissions.can_new_version}
              />
            </Grid.Column>

            <Grid.Column className="pt-5">
              {permissions.can_manage && (
                <ShareButton
                  disabled={!permissions.can_update_draft}
                  record={record}
                  permissions={permissions}
                  groupsEnabled={groupsEnabled}
                />
              )}
            </Grid.Column>
          </>
        )}
        <Overridable
          id="InvenioAppRdm.RecordLandingPage.RecordManagement.container"
          isPreviewSubmissionRequest={isPreviewSubmissionRequest}
          record={record}
          currentUserId={currentUserId}
        />
        {error && (
          <Grid.Row className="record-management">
            <Grid.Column>
              <Message negative>{error}</Message>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    );
  }
}

RecordManagement.propTypes = {
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  isDraft: PropTypes.bool.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
  isPreviewSubmissionRequest: PropTypes.bool.isRequired,
  currentUserId: PropTypes.string.isRequired,
  recordOwnerID: PropTypes.string.isRequired,
};
