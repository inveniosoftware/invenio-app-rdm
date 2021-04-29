// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useEffect, useState } from "react";
import { Dropdown, Icon, Input, Button, Modal } from "semantic-ui-react";
import axios from "axios";

export const ShareModal = (props) => {
  const [accessLinkObj, setAccessLinkObj] = useState();
  const [shareMode, setShareMode] = useState("view");

  const dropdownOptions = [
    { key: "view", text: "Can view", value: "view" },
    { key: "preview", text: "Can preview", value: "preview" },
    { key: "edit", text: "Can edit", value: "edit" },
  ];

  const message = {
    view: (
      <span>
        Anyone with this link{" "}
        <strong>can view all versions</strong> of this record & files.
      </span>
    ),
    preview: (
      <span>
        Anyone with this link{" "}
        <strong>can view all published and unpublished versions</strong> of this record & files.
      </span>
    ),
    edit: (
      <span>
        Anyone with an account and this link{" "}
        <strong>can edit all versions</strong> of this record & files.
      </span>
    ),
  };

  const getAccessLink = (linkObj) => {
    const extraParam = shareMode === "preview" ? "preview=1&" : "";
    return linkObj ? `${window.location}?${extraParam}token=${linkObj.token}` : "";
  };

  const updateAccessLink = async () => {
    await axios.patch(
      `/api/records/${props.recid}/access/links/${accessLinkObj.id}`,
      {
        permission: shareMode,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
  };

  const createAccessLink = async () => {
    await axios
      .post(
        `/api/records/${props.recid}/access/links`,
        { permission: shareMode },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((resp) => {
        setAccessLinkObj(resp.data);
      });
  };

  const copyAccessLink = () => {
    const copyText = document.querySelector("#input");
    copyText.select();
    document.execCommand("copy");
  };

  const handleChangeMode = (e, { value }) => setShareMode(value);

  const handleDelete = async () => {
    await axios
      .delete(`/api/records/${props.recid}/access/links/${accessLinkObj.id}`, {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      })
      .then(() => {
        setAccessLinkObj();
      });
  };

  useEffect(() => {
    if (!!accessLinkObj) {
      updateAccessLink();
    }
  }, [shareMode]);

  useEffect(() => {
    if (!!accessLinkObj) {
      setShareMode(accessLinkObj.permission);
    }
  }, [accessLinkObj]);

  useEffect(() => {
    async function fetchAccessLink() {
      const result = await axios(`/api/records/${props.recid}/access/links`, {
        headers: {
          Accept: "application/json",
        },
        withCredentials: true,
      });
      const { hits, total } = result.data.hits;
      if (total > 0) {
        // Only accessing first access link for MVP.
        setAccessLinkObj(hits[0]);
      }
    }
    fetchAccessLink();
  }, []);

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
          <Input id="input" value={getAccessLink(accessLinkObj)} readOnly />
          <Dropdown
            className="ui small share-link-dropdown"
            size="small"
            button
            options={dropdownOptions}
            defaultValue={shareMode}
            onChange={handleChangeMode}
          />
          <Button
            size="small"
            onClick={accessLinkObj ? copyAccessLink : createAccessLink}
            icon
          >
            <Icon name="copy outline" />
            {accessLinkObj ? "Copy link" : "Get a link"}
          </Button>
        </div>
        <Modal.Description>
          <p className="share-description">
            <Icon name="warning circle" />
            {!!!accessLinkObj
              ? 'No link has been created. Click on "Get a Link" to make a new link'
              : message[shareMode]}
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        {!!accessLinkObj && (
          <Button
            size="small"
            color="red"
            floated="left"
            onClick={handleDelete}
            icon
          >
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
