// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import { AccessRequestForm } from "./AccessRequestForm";
import React from "react";
import ReactDOM from "react-dom";

const recordAccessFormRoot = document.getElementById("access-request-form-root");
if (recordAccessFormRoot) {
  ReactDOM.render(
    <AccessRequestForm
      record={JSON.parse(recordAccessFormRoot.dataset.record)}
      isAnonymous={JSON.parse(recordAccessFormRoot.dataset.userAnonymous)}
      email={JSON.parse(recordAccessFormRoot.dataset.userEmail)}
      fullName={JSON.parse(recordAccessFormRoot.dataset.userFullName)}
    />,
    recordAccessFormRoot
  );
}
