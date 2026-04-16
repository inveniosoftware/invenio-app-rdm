// This file is part of InvenioRDM
// Copyright (C) 2023-2025 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Dropdown, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import UserBlockForm from "../administration/users/UserBlockForm";
import { RecordDeletion } from "../components/RecordDeletion";

export const ManageButton = ({
  record,
  recordOwnerID,
  permissions,
  recordDeletion,
  recordDeletionOptions,
  uiProps,
  auditLogsEnabled,
}) => {
  if (!(recordDeletion["valid_user"] || permissions?.can_moderate)) {
    return null;
  }
  const recordStatus = record.deletion_status.status;
  const recordOwner = record?.expanded?.parent?.access?.owned_by;
  return (
    <Dropdown
      fluid
      text={i18next.t("Manage")}
      icon="cog"
      floating
      labeled
      button
      className="icon text-align-center"
      {...uiProps}
    >
      <Dropdown.Menu>
        {recordDeletion["valid_user"] && (
          <>
            <Dropdown.Item>
              <RecordDeletion
                record={record}
                permissions={permissions}
                recordDeletion={recordDeletion}
                options={recordDeletionOptions}
                disabled={!recordDeletion["allowed"]}
              />
            </Dropdown.Item>

            {permissions?.can_moderate && <Dropdown.Divider />}
          </>
        )}
        {permissions?.can_moderate && (
          <>
            <Dropdown.Item
              as="a"
              href={`/administration/records?q=id:${record["id"]}&f=allversions:true&f=status:${recordStatus}`}
              target="_blank"
              key="manage_record"
              text={i18next.t("Manage record")}
            />
            {auditLogsEnabled && (
              <Dropdown.Item
                as="a"
                href={`/administration/audit-logs?q="${record["id"]}" OR "${record["parent"]["id"]}"&sort=newest`}
                target="_blank"
                key="view_audit_logs"
                text={i18next.t("View audit logs")}
              />
            )}
            {recordOwnerID && (
              <>
                <Dropdown.Item
                  as="a"
                  href={`/administration/users?q=id:${recordOwnerID}`}
                  target="_blank"
                  key="manage_user"
                  text={i18next.t("Manage user")}
                />
                <Dropdown.Divider />
                <BlockUserItem user={recordOwner || { id: recordOwnerID }} />
              </>
            )}
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

ManageButton.propTypes = {
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  recordOwnerID: PropTypes.string,
  recordDeletion: PropTypes.object,
  recordDeletionOptions: PropTypes.array,
  uiProps: PropTypes.object,
  auditLogsEnabled: PropTypes.bool,
};

ManageButton.defaultProps = {
  recordOwnerID: null,
  recordDeletion: {},
  recordDeletionOptions: [],
  uiProps: {},
  auditLogsEnabled: false,
};

const BlockUserItem = ({ user }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Dropdown.Item
        as="a"
        className="error"
        onClick={() => setModalOpen(true)}
        key="block_user"
        text={i18next.t("Block user")}
      />
      <Modal
        open={modalOpen}
        onClose={handleClose}
        role="dialog"
        closeOnDimmerClick={false}
      >
        <Modal.Header as="h2">{i18next.t("Block user")}</Modal.Header>
        {modalOpen && (
          <UserBlockForm
            user={user}
            actionSuccessCallback={handleClose}
            actionCancelCallback={handleClose}
          />
        )}
      </Modal>
    </>
  );
};

BlockUserItem.propTypes = {
  user: PropTypes.object.isRequired,
};
