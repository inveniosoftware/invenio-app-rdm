/*
 * SPDX-FileCopyrightText: 2021 CERN.
 * SPDX-FileCopyrightText: 2021 Northwestern University.
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-FileCopyrightText: 2023 TU Wien.
 * SPDX-License-Identifier: MIT
 */

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
