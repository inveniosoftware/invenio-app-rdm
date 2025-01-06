// This file is part of InvenioRDM
// Copyright (C) 2020-2024 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2022-2024 KTH Royal Institute of Technology.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

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
      permissions={getInputFromDOM("deposits-record-permissions")}
      filesLocked={getInputFromDOM("deposits-record-locked-files")}
      recordRestrictionGracePeriod={getInputFromDOM(
        "deposits-record-restriction-grace-period"
      )}
      allowRecordRestriction={getInputFromDOM("deposits-allow-record-restriction")}
      groupsEnabled={getInputFromDOM("config-groups-enabled")}
      allowEmptyFiles={getInputFromDOM("records-resources-allow-empty-files")}
      isDoiRequired={getInputFromDOM("deposits-is-doi-required")}
    />
  </OverridableContext.Provider>,
  document.getElementById("deposit-form")
);
