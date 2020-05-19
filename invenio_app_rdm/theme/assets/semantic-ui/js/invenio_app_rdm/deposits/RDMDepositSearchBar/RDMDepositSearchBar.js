// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Input } from "semantic-ui-react";

export class RDMDepositSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: "",
      searchUrl: props.config.searchUrl,
    };
  }

  onKeyPress = (event, input) => {
    if (event.key === "Enter") {
      this.executeSearch();
    }
  };

  onInputChange = (event, { value }) => {
    this.setState({
      currentValue: value,
    });
  };

  executeSearch = () => {
    window.location = `${this.state.searchUrl}?q=${this.state.currentValue}`;
  };

  render() {
    return (
      <Input
        action={{
          content: "Search",
          onClick: this.executeSearch,
        }}
        fluid
        placeholder="Type something"
        onChange={this.onInputChange}
        value={this.state.currentValue}
        onKeyPress={this.onKeyPress}
      />
    );
  }
}
