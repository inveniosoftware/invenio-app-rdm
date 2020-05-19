// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Container } from "semantic-ui-react";
import { ResultsList } from "react-searchkit";
import { templates } from "../../../../config";

export class ResultsListItem extends Component {
  constructor(props) {
    super(props);
    this.listItemTemplate = templates.ResultsItemTemplate;
  }

  render() {
    return (
      <Container>
        <ResultsList renderListItem={this.listItemTemplate} />
      </Container>
    );
  }
}
