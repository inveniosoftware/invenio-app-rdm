// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { overrideStore } from "react-overridable";
import { Card, Input, Item } from "semantic-ui-react";
import _truncate from "lodash/truncate";

const RDMRecordResultsListItem = ({ result, index }) => {
  return (
    <Item key={index} href={`/records/${result.id}`}>
      <Item.Content>
        <Item.Header>{result.metadata.titles[0].title}</Item.Header>
        <Item.Description>
          {_truncate(result.metadata.descriptions[0].description, {
            length: 200,
          })}
        </Item.Description>
      </Item.Content>
    </Item>
  );
};

overrideStore.add("ResultsList.item", RDMRecordResultsListItem);

const RDMRecordResultsGridItem = ({ result, index }) => {
  return (
    <Card fluid key={index} href={`/records/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.titles[0].title}</Card.Header>
        <Card.Description>
          {_truncate(result.metadata.descriptions[0].description, {
            length: 200,
          })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

overrideStore.add("ResultsGrid.item", RDMRecordResultsGridItem);

const RDMRecordSearchBarElement = ({
  placeholder: passedPlaceholder,
  queryString,
  onInputChange,
  executeSearch,
}) => {
  const placeholder = passedPlaceholder || "Search";
  const onBtnSearchClick = () => {
    executeSearch();
  };
  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      executeSearch();
    }
  };
  return (
    <Input
      action={{
        icon: "search",
        onClick: onBtnSearchClick,
        color: "orange",
        className: "invenio-theme-search-button",
      }}
      placeholder={placeholder}
      onChange={(event, { value }) => {
        onInputChange(value);
      }}
      value={queryString}
      onKeyPress={onKeyPress}
    />
  );
};

overrideStore.add("SearchBar.element", RDMRecordSearchBarElement);
