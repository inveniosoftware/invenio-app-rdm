// This file is part of InvenioRDM
// Copyright (C) 2023-2024 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Dropdown, Modal, Button, Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { http } from "react-invenio-forms";
import { APIRoutes } from "../administration/users/api/routes";

export const ManageButton = ({ recid, recordOwnerID }) => {
  return (
    <Dropdown
      fluid
      text={i18next.t("Manage")}
      icon="cog"
      floating
      labeled
      button
      className="icon text-align-center"
    >
      <Dropdown.Menu>
        <Dropdown.Item
          as="a"
          href={`/administration/records?q=id:${recid}`}
          target="_blank"
          key="manage_record"
          text={i18next.t("Manage record")}
        />
        <Dropdown.Item
          as="a"
          href={`/administration/users?q=id:${recordOwnerID}`}
          target="_blank"
          key="manage_user"
          text={i18next.t("Manage user")}
        />
        <Dropdown.Divider />
        {recordOwnerID && <BlockUserItem recordOwnerID={recordOwnerID} />}
      </Dropdown.Menu>
    </Dropdown>
  );
};

ManageButton.propTypes = {
  recid: PropTypes.string.isRequired,
  recordOwnerID: PropTypes.string.isRequired,
};

const BlockUserItem = ({ recordOwnerID }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);
  const blockUser = () => {
    http.post(APIRoutes.block({ id: recordOwnerID }));
    handleClose();
  };

  return (
    <>
      <Dropdown.Item
        as="a"
        className="error"
        onClick={handleOpen}
        key="block_user"
        text={i18next.t("Block user")}
      />
      <Modal
        open={modalOpen}
        closeIcon
        onClose={handleClose}
        role="dialog"
        closeOnDimmerClick={false}
      >
        <Modal.Header as="h2">{i18next.t("Block User")}</Modal.Header>
        <Modal.Description>
          <Message
            warning
            icon="warning sign"
            content={i18next.t(
              "Blocking the user will delete all existing records of the user."
            )}
          />
        </Modal.Description>
        <Modal.Actions>
          <Button onClick={() => handleClose()} floated="left">
            Cancel
          </Button>
          <Button
            size="small"
            labelPosition="left"
            icon="warning"
            color="red"
            content={i18next.t("Block")}
            onClick={blockUser}
          />
        </Modal.Actions>
      </Modal>
    </>
  );
};

BlockUserItem.propTypes = {
  recordOwnerID: PropTypes.string.isRequired,
};
