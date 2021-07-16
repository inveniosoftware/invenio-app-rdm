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
import { Header, Placeholder, List, Grid } from "semantic-ui-react";
import { withCancel } from "../utils";
import { CopyButton } from "../utlis/CopyButton";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class RecordCitationField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      citation: "",
      error: null,
      selectedStyle: null,
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
        <Placeholder.Header>
          <Placeholder.Line />
        </Placeholder.Header>
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
      error: "",
      selectedStyle: null,
    });
    this.cancellableFetchCitation = withCancel(
      this.fetchCitation(record, style)
    );
    try {
      const response = await this.cancellableFetchCitation.promise;
      this.setState({
        loading: false,
        citation: response.data,
        selectedStyle: style,
      });
    } catch (error) {
      if (error !== "UNMOUNTED") {
        this.setState({
          loading: false,
          citation: "",
          error:
          i18next.t('An error ocurred while generating the citation, please try again. If this error continues please contact our technical support.'),
        });
      }
    }
  };

  render() {
    const { styles, record } = this.props;
    const { loading, citation, error, selectedStyle } = this.state;

    return (
      <div id="record-citation">
        <Header size="medium">{i18next.t('Citation')}</Header>
        <Grid container>
          <Grid.Row className="no-padding-tb">
            <div className="citation-style-selector">
              <p className="citation-style-p">
                <b>{i18next.t('Style')}</b>
              </p>
              <List celled horizontal className="separated-list">
                {styles.map((style) => {
                  return (
                    <List.Item key={style[0]}>
                      <a
                        onClick={_debounce(
                          () => this.getCitation(record, style[0]),
                          500
                        )}
                        className="citation-style-link"
                      >
                        <span
                          className={
                            selectedStyle === style[0]
                              ? "selected-citation-type"
                              : ""
                          }
                        >
                          {style[1]}
                        </span>
                      </a>
                    </List.Item>
                  );
                })}
              </List>
            </div>
          </Grid.Row>
          <Grid.Row className="no-padding-t">
            <Grid.Column width={14} className="no-padding">
              <div id="citation-text">
                {loading ? this.placeholderLoader() : citation}
              </div>
            </Grid.Column>
            <Grid.Column width={2} className="no-padding-lr" textAlign="right">
              <CopyButton text={citation} position="top" />
            </Grid.Column>
          </Grid.Row>
          {error ? this.errorMessage(error) : null}
        </Grid>
      </div>
    );
  }
}

RecordCitationField.propTypes = {
  styles: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  defaultStyle: PropTypes.string.isRequired,
};
