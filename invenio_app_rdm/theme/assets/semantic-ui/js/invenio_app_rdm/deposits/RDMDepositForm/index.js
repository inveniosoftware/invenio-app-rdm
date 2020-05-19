// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";

import { getConfigFromDOM, getRecordFromDOM } from "react-invenio-deposit";
import { RDMDepositForm } from "./RDMDepositForm";

ReactDOM.render(
  <RDMDepositForm
    record={getRecordFromDOM("deposits-record")}
    config={getConfigFromDOM("deposits-config")}
  />,
  document.getElementById("deposit-form")
);
