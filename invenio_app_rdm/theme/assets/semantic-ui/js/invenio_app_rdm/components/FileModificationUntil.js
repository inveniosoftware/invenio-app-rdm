// This file is part of InvenioRDM
// Copyright (C) 2025 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class FileModificationUntil extends Component {
  render() {
    const { filesLocked, fileModification, record } = this.props;

    if (!fileModification.fileModification?.enabled) {
      return null;
    }

    if (!filesLocked && record.is_published && fileModification.context?.days_until) {
      return (
        <>
          {" "}
          {i18next.t("– Unlocked, {{ daysUntil }} days to publish changes", {
            daysUntil: fileModification.context.days_until,
          })}
        </>
      );
    }

    return null;
  }
}

FileModificationUntil.propTypes = {
  filesLocked: PropTypes.bool.isRequired,
  fileModification: PropTypes.object,
  record: PropTypes.object.isRequired,
};

FileModificationUntil.defaultProps = {
  fileModification: {},
};
