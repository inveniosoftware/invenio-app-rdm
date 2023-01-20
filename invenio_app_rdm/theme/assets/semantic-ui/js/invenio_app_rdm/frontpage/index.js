// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import { RecordsListOverridable } from "./RecordsList";
import { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();
const recordsListContainer = document.getElementById("records-list");
const title = recordsListContainer.dataset.title;
const fetchUrl = recordsListContainer.dataset.fetchUrl;
const appName = "InvenioAppRDM.RecordsList";

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RecordsListOverridable title={title} fetchUrl={fetchUrl} appName={appName} />
  </OverridableContext.Provider>,
  recordsListContainer
);
