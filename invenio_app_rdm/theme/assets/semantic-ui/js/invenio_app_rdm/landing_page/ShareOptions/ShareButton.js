/*
 * SPDX-FileCopyrightText: 2021-2024 CERN.
 * SPDX-FileCopyrightText: 2021 Northwestern University.
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-FileCopyrightText: 2023 TU Wien.
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from "react";
import { Icon, Button, Popup } from "semantic-ui-react";
import { ShareModal } from "./ShareModal";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

export const ShareButton = ({ disabled, record, permissions, groupsEnabled }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Popup
        content={i18next.t("You don't have permissions to share this record.")}
        disabled={!disabled}
        trigger={
          <Button
            fluid
            onClick={handleOpen}
            disabled={disabled}
            primary
            size="medium"
            aria-haspopup="dialog"
            icon
            labelPosition="left"
          >
            <Icon name="share square" />
            {i18next.t("Share")}
          </Button>
        }
      />
      <ShareModal
        open={modalOpen}
        handleClose={handleClose}
        record={record}
        permissions={permissions}
        groupsEnabled={groupsEnabled}
      />
    </>
  );
};

ShareButton.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
};

ShareButton.defaultProps = {
  disabled: false,
};
