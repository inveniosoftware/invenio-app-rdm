// This file is part of InvenioRDM
// Copyright (C) 2023-2025 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect, useState } from "react";
import { Dropdown, Modal, Button, Message } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { http } from "react-invenio-forms";
import { APIRoutes } from "../administration/users/api/routes";
import { RecordDeletion } from "../components/RecordDeletion";

const fetchOptions = async () => {
  const url = "/api/vocabularies/removalreasons?q=tags:deletion-request";
  const req = http.get(url);
  try {
    const response = await req;
    const data = response.data.hits.hits;

    const options = data.map((x) => {
      return {
        text: x["title_l10n"],
        value: x["id"],
      };
    });
    return options;
  } catch (e) {
    console.error(e);
  }
};

export const ManageButton = ({
  record,
  recordOwnerID,
  permissions,
  recordDeletion,
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetchOptions().then(setOptions);
  }, []);

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
        {recordDeletion["valid_user"] && (
          <>
            <Dropdown.Item>
              <RecordDeletion
                record={record}
                permissions={permissions}
                recordDeletion={recordDeletion}
                options={options}
                disabled={!recordDeletion["allowed"]}
              />
            </Dropdown.Item>

            {permissions.can_moderate && <Dropdown.Divider />}
          </>
        )}
        {permissions.can_moderate && (
          <>
            <Dropdown.Item
              as="a"
              href={`/administration/records?q=id:${record["id"]}`}
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
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

ManageButton.propTypes = {
  record: PropTypes.object.isRequired,
  recordOwnerID: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  recordDeletion: PropTypes.object.isRequired,
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
