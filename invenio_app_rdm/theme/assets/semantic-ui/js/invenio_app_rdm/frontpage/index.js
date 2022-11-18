// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import RecordsList from "./RecordsList";
import { OverridableContext } from "react-overridable";
import { overriddenComponents } from "./override";

const recordsListContainer = document.getElementById("records-list");
const title = recordsListContainer.dataset.title;
const fetchUrl = recordsListContainer.dataset.fetchUrl;

ReactDOM.render(
  <OverridableContext.Provider value={overriddenComponents}>
    <RecordsList title={title} fetchUrl={fetchUrl} />
  </OverridableContext.Provider>,
  recordsListContainer
);
