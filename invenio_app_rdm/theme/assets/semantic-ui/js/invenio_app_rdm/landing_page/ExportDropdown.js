// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
// Copyright (C) 2023 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Dropdown, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ExportDropdown extends Component {
  constructor(props) {
    super(props);
    const { formats } = this.props;
    this.state = {
      selectedFormatUrl: formats[0]?.export_url,
    };
  }
  render() {
    const { formats } = this.props;
    const { selectedFormatUrl } = this.state;
    const exportOptions = formats.map((option, index) => {
      return {
        key: `option-${index}`,
        text: option.name,
        value: option.export_url,
      };
    });

    return (
      <Grid>
        <Grid.Column width={11}>
          <Dropdown
            aria-label={i18next.t("Export selection")}
            selection
            fluid
            selectOnNavigation={false}
            options={exportOptions}
            onChange={(event, data) => this.setState({ selectedFormatUrl: data.value })}
            defaultValue={selectedFormatUrl}
          />
        </Grid.Column>
        <Grid.Column width={5} className="pl-0">
          <Button
            as="a"
            role="button"
            fluid
            href={selectedFormatUrl}
            title={i18next.t("Download file")}
          >
            {i18next.t("Export")}
          </Button>
        </Grid.Column>
      </Grid>
    );
  }
}

ExportDropdown.propTypes = {
  formats: PropTypes.array.isRequired,
};
