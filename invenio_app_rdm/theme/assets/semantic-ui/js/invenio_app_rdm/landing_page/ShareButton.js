// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Icon, Button, Popup } from "semantic-ui-react";
import { ShareModal } from "./ShareModal";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export const ShareButton = (props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Popup
        content={i18next.t("You don't have permissions to share this record.")}
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
              {i18next.t('Share')}
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
