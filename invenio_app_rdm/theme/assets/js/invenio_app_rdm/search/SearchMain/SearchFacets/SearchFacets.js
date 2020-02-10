// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component, Fragment } from "react";
import { Checkbox, List } from "semantic-ui-react";
import { BucketAggregation } from "react-searchkit";
import { config } from "../../config";

export class SearchFacets extends Component {
  _renderValueElement = (
    bucket,
    isSelected,
    onFilterClicked,
    getChildAggCmps
  ) => {
    const childAggCmps = getChildAggCmps(bucket);
    const key = bucket.key_as_string ? bucket.key_as_string : bucket.key;
    return (
      <List.Item key={bucket.key}>
        <List.Content floated="right">
          <label>{bucket.doc_count}</label>
        </List.Content>
        <List.Content>
          <Checkbox
            label={<label>{key}</label>}
            value={key}
            onClick={() => onFilterClicked(key)}
            checked={isSelected}
          />
          {childAggCmps}
        </List.Content>
      </List.Item>
    );
  };

  renderAggregations = () => {
    return config.aggregations.map((aggConfig, index) => {
      const { title, agg } = aggConfig;
      return (
        <Fragment key={index}>
          <BucketAggregation
            title={title}
            agg={agg}
            renderValueElement={this._renderValueElement}
          />
        </Fragment>
      );
    });
  };

  render() {
    return <Fragment>{this.renderAggregations()}</Fragment>;
  }
}
