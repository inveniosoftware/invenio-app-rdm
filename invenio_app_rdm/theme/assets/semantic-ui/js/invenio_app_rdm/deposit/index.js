// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import { getInputFromDOM } from "react-invenio-deposit";
import "semantic-ui-less/semantic.less";
import { RDMDepositForm } from "./RDMDepositForm";

ReactDOM.render(
  <RDMDepositForm
    record={getInputFromDOM("deposits-record")}
    preselectedCommunity={getInputFromDOM("deposits-draft-community")}
    files={getInputFromDOM("deposits-record-files")}
    config={getInputFromDOM("deposits-config")}
    permissions={getInputFromDOM("deposits-record-permissions")}
  />,
  document.getElementById("deposit-form")
);
