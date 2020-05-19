// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import { RDMDepositSearchBar } from "./RDMDepositSearchBar";
import { getConfigFromDOM } from "react-invenio-deposit";

ReactDOM.render(
  <RDMDepositSearchBar
    config={getConfigFromDOM("deposits-searchbar-config")}
  />,
  document.getElementById("deposits-searchbar")
);
