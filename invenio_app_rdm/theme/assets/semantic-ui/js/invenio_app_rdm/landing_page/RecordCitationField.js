// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _get from "lodash/get";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Header, Placeholder } from "semantic-ui-react";
import { withCancel } from "../utils";

export class RecordCitationField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      citation: "",
      error: null,
    };
  }

  componentDidMount() {
    const { record, defaultStyle } = this.props;
    this.getCitation(record, defaultStyle);
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
    const response = await axios(
      `${record.links.self}?locale=${navigator.language}&style=${style}`,
      {
        headers: {
          Accept: "text/x-bibliography",
        },
      }
    );
    return response;
  };

  getCitation = async (record, style) => {
    this.setState({
      loading: true,
      error: "",
    });
    this.cancellableFetchCitation = withCancel(
      this.fetchCitation(record, style)
    );
    try {
      const response = await this.cancellableFetchCitation.promise;
      this.setState({
        loading: false,
        citation: response.data,
      });
    } catch (error) {
      if (error !== "UNMOUNTED") {
        this.setState({
          loading: false,
          citation: "",
          error:
            "An error ocurred while generating the citation, please try again. If this error continues please contact our technical support.",
        });
      }
    }
  };

  render() {
    const { styles, record } = this.props;
    const { loading, citation, error } = this.state;
    return (
      <div id="record-citation">
        <Header size="medium">Citation</Header>
        {loading ? this.placeholderLoader() : citation}
        {error ? this.errorMessage(error) : null}
        <div className="citation-style-selector">
          <p className="citation-style-p">
            <b>Style</b>
          </p>
          {styles.map((style) => {
            return (
              <a
                onClick={() => this.getCitation(record, style[0])}
                className={
                  loading
                    ? "citation-style-link loading"
                    : "citation-style-link"
                }
              >
                {style[1]}
              </a>
            );
          })}
        </div>
      </div>
    );
  }
}

RecordCitationField.propTypes = {
  styles: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  defaultStyle: PropTypes.string.isRequired
};
