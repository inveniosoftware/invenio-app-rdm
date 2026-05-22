/*
 * SPDX-FileCopyrightText: 2022 CERN.
 * SPDX-License-Identifier: MIT
 */

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
