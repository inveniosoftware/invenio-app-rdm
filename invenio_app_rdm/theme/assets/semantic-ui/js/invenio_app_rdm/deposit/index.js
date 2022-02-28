// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { getInputFromDOM } from "react-invenio-deposit";
import { RDMDepositForm } from "./RDMDepositForm";

ReactDOM.render(
  <RDMDepositForm
    record={getInputFromDOM("deposits-record")}
    community={getInputFromDOM("deposits-draft-community")}
    files={getInputFromDOM("deposits-record-files")}
    config={getInputFromDOM("deposits-config")}
    permissions={getInputFromDOM("deposits-record-permissions")}
    communitiesEnabled={getInputFromDOM("communities-enabled")}
  />,
  document.getElementById("deposit-form")
);
