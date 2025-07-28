// This file is part of InvenioRDM
// Copyright (C) 2025.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Button, Popup } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { DeletionModal } from "./RecordDeletion/DeletionModal";

export const RecordDeletion = ({
  disabled,
  record,
  permissions,
  recordDeletionChecklist,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <Popup
        content={i18next.t("You don't have permissions to delete this record.")}
        disabled={!disabled}
        trigger={
          <Button
            fluid
            onClick={handleOpen}
            disabled={disabled}
            className="negative"
            aria-haspopup="dialog"
            icon="trash outline alternate"
            labelPosition="left"
            content={i18next.t("Delete record")}
          />
        }
      />
      <DeletionModal
        open={modalOpen}
        handleClose={handleClose}
        record={record}
        permissions={permissions}
        recordDeletionChecklist={recordDeletionChecklist}
      />
    </>
  );
};

RecordDeletion.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  recordDeletionChecklist: PropTypes.array,
};

RecordDeletion.defaultProps = {
  disabled: false,
  recordDeletionChecklist: [],
};
