// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import RecordsList from "./records-list";

const recordsListContainer = document.getElementById("records-list");
const title = recordsListContainer.dataset.title;
const fetchUrl = recordsListContainer.dataset.fetchUrl;

ReactDOM.render(
  <RecordsList title={title} fetchUrl={fetchUrl} />,
  recordsListContainer
);
