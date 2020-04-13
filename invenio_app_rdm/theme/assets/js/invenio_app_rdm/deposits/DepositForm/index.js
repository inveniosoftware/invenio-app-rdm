// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";

import { DepositForm } from "./DepositForm";


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

const getRecordFromDOM = () => {
  const element = document.getElementsByName("drafts-record");
  if (element.length > 0 && element[0].hasAttribute("value")) {
    return JSON.parse(element[0].value);
  }
  return null;
};

const getConfigFromDOM = () => {
  const element = document.getElementsByName("drafts-config");
  if (element.length > 0 && element[0].hasAttribute("value")) {
    return JSON.parse(element[0].value);
  }
  return null;
};

class App extends React.Component {
  render() {
    return (
      <DepositForm record={getRecordFromDOM()} config={getConfigFromDOM()} />
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById("deposit-form")
);
