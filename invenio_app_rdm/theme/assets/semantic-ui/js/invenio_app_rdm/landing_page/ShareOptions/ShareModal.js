// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Icon, Button, Modal, Tab } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { LinksTab } from "./AccessLinks/LinksTab";
// import { GrantsTab } from "./GrantsTab";

export const ShareModal = ({ record, open, handleClose, accessLinksSearchConfig }) => {
  const panes = [
    {
      menuItem: { icon: "linkify", content: "Links" },
      pane: (
        <Tab.Pane className="borderless" attached="top" key="accessLinks">
          <LinksTab record={record} accessLinksSearchConfig={accessLinksSearchConfig} />
        </Tab.Pane>
      ),
    },
  ];

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
      <Modal.Header id="access-link-modal-header">
        <Icon name="share square" />
        {i18next.t("Share access")}
      </Modal.Header>

      <Modal.Content>
        <Tab
          menu={{ secondary: true, pointing: true }}
          panes={panes}
          renderActiveOnly={false}
        />
      </Modal.Content>

      <Modal.Actions>
        <Button size="small" onClick={handleClose}>
          {i18next.t("Close")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

ShareModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  accessLinksSearchConfig: PropTypes.object.isRequired,
};
