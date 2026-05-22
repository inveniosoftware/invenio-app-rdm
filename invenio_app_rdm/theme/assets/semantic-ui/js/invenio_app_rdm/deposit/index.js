/*
 * SPDX-FileCopyrightText: 2020-2025 CERN.
 * SPDX-FileCopyrightText: 2020-2022 Northwestern University.
 * SPDX-FileCopyrightText: 2022-2024 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import ReactDOM from "react-dom";
import { getInputFromDOM } from "@js/invenio_rdm_records";
import { RDMDepositForm } from "./RDMDepositForm";
import { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RDMDepositForm
      record={getInputFromDOM("deposits-record")}
      preselectedCommunity={getInputFromDOM("deposits-draft-community")}
      files={getInputFromDOM("deposits-record-files")}
      config={getInputFromDOM("deposits-config")}
      useUppy={getInputFromDOM("deposits-use-uppy-ui")}
      permissions={getInputFromDOM("deposits-record-permissions")}
      filesLocked={getInputFromDOM("deposits-record-locked-files")}
      recordRestrictionGracePeriod={getInputFromDOM(
        "deposits-record-restriction-grace-period"
      )}
      allowRecordRestriction={getInputFromDOM("deposits-allow-record-restriction")}
      recordDeletion={getInputFromDOM("deposits-record-deletion")}
      fileModification={getInputFromDOM("deposits-file-modification")}
      groupsEnabled={getInputFromDOM("config-groups-enabled")}
      allowEmptyFiles={getInputFromDOM("records-resources-allow-empty-files")}
      isDoiRequired={getInputFromDOM("deposits-is-doi-required")}
    />
  </OverridableContext.Provider>,
  document.getElementById("deposit-form")
);
