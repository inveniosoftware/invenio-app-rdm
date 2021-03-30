// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Dropdown, Icon, Input, Button, Modal } from "semantic-ui-react";

export const ShareModal = (props) => {
  const [link, setLink] = useState("");
  const [shareMode, setShareMode] = useState("view");

  const handleChangeMode = (e, { value }) => setShareMode(value);
  const options = [
    { key: "view", text: "Can view", value: "view" },
    { key: "edit", text: "Can edit", value: "edit" },
  ];

  const message = {
    view: (
      <span>
        Anyone on the Internet with this link{" "}
        <strong>can view all versions</strong> of this record & files.
      </span>
    ),
    edit: (
      <span>
        Anyone with an account and this link{" "}
        <strong>can edit all versions</strong> of this record & files.
      </span>
    ),
  };

  return (
    <Modal
      open={props.open}
      onClose={props.handleClose}
      className="share-modal"
    >
      <Modal.Header>
        <Icon name="share alternate" />
        Get a link
      </Modal.Header>
      <Modal.Content>
        <div className="share-content">
          <Input value={link} disabled />
          <Dropdown
            className="ui small"
            size="small"
            button
            options={options}
            defaultValue={shareMode}
            onChange={handleChangeMode}
          />
          <Button size="small" icon>
            <Icon name="copy outline" />
            {link ? "Copy link" : "Get a link"}
          </Button>
        </div>
        <Modal.Description>
          <p>
            <Icon name="warning circle" />
            {!!!link
              ? 'No link has been created. Click on "Get a Link" to make a new link'
              : message[shareMode]}
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {!!link && (
          <Button size="small" color="red" floated="left" icon>
            <Icon name="trash alternate outline" />
            Delete link
          </Button>
        )}
        <Button size="small" onClick={props.handleClose}>
          Done
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
