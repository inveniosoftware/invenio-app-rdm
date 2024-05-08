// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect as connectFormik } from "formik";
import { connect } from "react-redux";
import _get from "lodash/get";
import { ShareButton } from "../landing_page/ShareOptions/ShareButton";

class ShareDraftButtonComponent extends Component {
  isDisabled = (values, isSubmitting, numberOfFiles) => {
    const { disabled } = this.props;
    if (disabled) return true;

    const filesEnabled = _get(values, "files.enabled", false);
    const filesMissing = filesEnabled && !numberOfFiles;
    const dataEmpty = Object.keys(values.expanded).length === 0;

    return isSubmitting || filesMissing || dataEmpty;
  };

  render() {
    const { numberOfFiles, record, permissions, groupsEnabled, formik } = this.props;
    const { values, isSubmitting } = formik;

    record.expanded = values.expanded;
    record.links = values.links;
    record.parent.access["settings"] = values.parent?.access?.settings;

    return (
      <ShareButton
        disabled={this.isDisabled(values, isSubmitting, numberOfFiles)}
        record={record}
        permissions={permissions}
        groupsEnabled={groupsEnabled}
      />
    );
  }
}

ShareDraftButtonComponent.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  groupsEnabled: PropTypes.bool.isRequired,
  formik: PropTypes.object.isRequired,
  numberOfFiles: PropTypes.number.isRequired,
};

ShareDraftButtonComponent.defaultProps = {
  disabled: false,
};

const mapStateToProps = (state) => ({
  numberOfFiles: Object.values(state.files.entries).length,
});

export const ShareDraftButton = connect(
  mapStateToProps,
  null
)(connectFormik(ShareDraftButtonComponent));
