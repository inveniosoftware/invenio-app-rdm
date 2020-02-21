// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input } from "semantic-ui-react";
import {
  UrlHandlerApi,
  onQueryChanged as triggeronQueryChanged
} from "react-searchkit";

export class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.urlHandlerApi = new UrlHandlerApi({});
    this.state = {
      currentValue:
        this.urlHandlerApi.get({ queryString: "" }).queryString || ""
    };
    this.renderElement = props.renderElement || this._renderElement;
  }

  _renderElement(placeholder, queryString, onInputChange, executeSearch) {
    placeholder = placeholder || "Type something";
    const onBtnSearchClick = (event, input) => {
      executeSearch();
    };
    const onKeyPress = (event, input) => {
      if (event.key === "Enter") {
        executeSearch();
      }
    };
    return (
      <Input
        action={{
          content: "Search",
          onClick: onBtnSearchClick
        }}
        fluid
        placeholder={placeholder}
        onChange={(event, { value }) => {
          onInputChange(value);
        }}
        value={queryString}
        onKeyPress={onKeyPress}
      />
    );
  }

  onInputChange = queryString => {
    this.setState({
      currentValue: queryString
    });
  };

  executeSearch = () => {
    triggeronQueryChanged({
      searchQuery: { queryString: this.state.currentValue }
    });
  };

  render() {
    const { placeholder } = this.props;
    return this.renderElement(
      placeholder,
      this.state.currentValue,
      this.onInputChange,
      this.executeSearch
    );
  }
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  queryString: PropTypes.string.isRequired,
  renderElement: PropTypes.func
};

SearchBar.defaultProps = {
  placeholder: "",
  queryString: "",
  renderElement: null
};
