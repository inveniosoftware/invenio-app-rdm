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
import {StumbleItem} from "../user_dashboard/stumble"
import { withCancel, http } from "react-invenio-forms";
import _ from 'lodash'

export class ExportDropdown extends Component {
  constructor(props) {
    super(props);
    const { formats } = this.props;
    this.state = {
      data: { hits: [] },
      selectedFormatUrl: formats[0]?.export_url,
    };
  }
  
  componentDidMount() {
    this.fetchData();
  }
  
  componentWillUnmount() {
    this.cancellableFetch && this.cancellableFetch.cancel();
  }
  fetchData = async () => {
    this.setState({ isLoading: true });

    this.cancellableFetch = withCancel(
      http.get( "/api/records?sort=newest&size=20", {
        headers: {
          Accept: "application/vnd.inveniordm.v1+json",
        },
      })
    );

    try {
      const response = await this.cancellableFetch.promise;
       console.log(response.data.aggregations.resource_type)
      this.setState({ data: response.data.hits, isLoading: false });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.response.data.message, isLoading: false });
    }}
  render() {
    const { formats } = this.props;
    const { selectedFormatUrl ,data} = this.state;
    const record = data.hits
    _.shuffle(record)
    const exportOptions = formats.map((option, index) => {
      return {
        key: `option-${index}`,
        text: option.name,
        value: option.export_url,
      };
    });

    return (
      
      <Grid>
        <Grid.Column width={14}>
        <StumbleItem result={data.hits}/>
        </Grid.Column>
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
          <br></br>
          
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
