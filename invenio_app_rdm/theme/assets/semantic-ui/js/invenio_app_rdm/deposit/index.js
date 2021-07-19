// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import { I18nextProvider } from 'react-i18next';
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { getInputFromDOM } from "react-invenio-deposit";
import { RDMDepositForm } from "./RDMDepositForm";


ReactDOM.render(
  <I18nextProvider i18n={i18next}>
  <RDMDepositForm
    record={getInputFromDOM("deposits-record")}
    files={getInputFromDOM("deposits-record-files")}
    config={getInputFromDOM("deposits-config")}
    permissions={getInputFromDOM("deposits-record-permissions")}
  /></I18nextProvider>,
  document.getElementById("deposit-form")
);
