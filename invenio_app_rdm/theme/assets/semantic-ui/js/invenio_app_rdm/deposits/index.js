/*
 * This file is part of Invenio.
 * Copyright (C) 2020 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import ReactDOM from "react-dom";
import { SearchApp } from "./RDMDepositSearchApp";

export function initSearchApp(elementId, config) {
  const rootElement = document.getElementById(elementId);
  const appName = rootElement.getAttribute("data-name");
  return ReactDOM.render(
    <SearchApp config={config} appName={appName} />,
    rootElement
  );
}

window.initSearchApp = initSearchApp;
