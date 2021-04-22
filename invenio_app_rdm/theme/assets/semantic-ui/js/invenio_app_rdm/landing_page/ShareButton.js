// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Icon, Button, Popup } from "semantic-ui-react";
import { ShareModal } from "./ShareModal";

export const ShareButton = (props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Popup
        content="You don't have permissions to share this record."
        disabled={!props.disabled}
        trigger={
          <div className={props.divClassName}>
            <Button
              onClick={handleOpen}
              disabled={props.disabled}
              primary
              size="mini"
            >
              <Icon name="share square" />
              Share
            </Button>
          </div>
        }
      />
      <ShareModal
        open={modalOpen}
        handleClose={handleClose}
        recid={props.recid}
      />
    </>
  );
};
