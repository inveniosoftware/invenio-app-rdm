// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _debounce from "lodash/debounce";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Header, Placeholder, Grid, Dropdown } from "semantic-ui-react";
import { withCancel } from "../utils";
import { CopyButton } from "../utlis/CopyButton";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class RecordCitationField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      citation: "",
      error: null
    };
  }

  componentDidMount() {
    const { record, defaultStyle } = this.props;
    this.getCitation(record, defaultStyle);
  }

  componentWillUnmount() {
    this.cancellableFetchCitation?.cancel();
  }

  placeholderLoader = () => {
    return (
      <Placeholder>
          <Placeholder.Paragraph>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Paragraph>
      </Placeholder>
    );
  };

  errorMessage = (message) => {
    return (
      <div className="citation-error-message">
        <p>{message}</p>
      </div>
    );
  };

  fetchCitation = async (record, style) => {
    return await axios(
      `${record.links.self}?locale=${navigator.language}&style=${style}`,
      {
        headers: {
          Accept: "text/x-bibliography",
        },
      }
    );
  };

  getCitation = async (record, style) => {
    this.setState({
      loading: true,
      citation: "",
      error: ""
    });

    this.cancellableFetchCitation = withCancel(
      this.fetchCitation(record, style)
    );

    try {
      const response = await this.cancellableFetchCitation.promise;
      this.setState({
        loading: false,
        citation: response.data
      });
    } 
    catch (error) {
      if (error !== "UNMOUNTED") {
        this.setState({
          loading: false,
          citation: "",
          error: i18next.t("An error ocurred while generating the citation."),
        });
      }
    }
  };

  render() {
    const { styles, record, defaultStyle } = this.props;
    const { loading, citation, error } = this.state;

    const citationOptions = styles.map((style) => {
      return {
        key: style[0],
        value: style[0],
        text: style[1]
      }
    })

    return (
      <Grid id="record-citation">
        <Grid.Row verticalAlign="middle" className="relaxed">
          <Grid.Column mobile={8} tablet={8} computer={12} className="no-padding">
            <Header as="h2">{i18next.t("Citation")}</Header>
          </Grid.Column>

          <Grid.Column mobile={8} tablet={8} computer={4} className="no-padding" textAlign="right">
            <div className="citation-style-selector">
              <label>{i18next.t("Style")}</label>
              <Dropdown
                className="citation-dropdown"
                defaultValue={defaultStyle}
                options={citationOptions}
                selection
                onChange={_debounce(
                  (event, data) => this.getCitation(record, data.value),
                  500
                )}
              />
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row verticalAlign="bottom">
          <Grid.Column computer={12} className="no-padding">
            <div id="citation-text">
              {loading ? this.placeholderLoader() : citation}
            </div>
          </Grid.Column>

          <Grid.Column computer={4} className="no-padding" textAlign="right">
            <CopyButton text={citation}/>
          </Grid.Column>
        </Grid.Row>

        {error ? this.errorMessage(error) : null}
      </Grid>
    );
  }
}

RecordCitationField.propTypes = {
  styles: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  defaultStyle: PropTypes.string.isRequired,
};
