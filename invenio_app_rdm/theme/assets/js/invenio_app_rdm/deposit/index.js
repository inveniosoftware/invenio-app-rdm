// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";  // needs to be in scope when using JSX (from webpack)
import ReactDOM from "react-dom";
// import "semantic-ui-css/semantic.min.css";

import { DepositForm } from "./DepositForm";

const depositElement = document.getElementById("deposit-main");

function getJSONData(element) {
  if (element.hasAttribute("data")) {
    const data = element.getAttribute('data');
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Couldn't parse 'data' from ", element);
      console.error("Using {} instead.");
      console.error("Exception ", e);
    }
  }
  return {};
}


const data = getJSONData(depositElement);

ReactDOM.render(
  <DepositForm
    data={data}
  />,
  depositElement
);
