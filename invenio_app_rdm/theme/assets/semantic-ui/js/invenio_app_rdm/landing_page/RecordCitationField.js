// This file is part of InvenioRDM
// Copyright (C) 2021-2024 CERN.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 TU Wien
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _debounce from "lodash/debounce";
import _escape from "lodash/escape";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Placeholder, Dropdown, Message } from "semantic-ui-react";
import { withCancel } from "react-invenio-forms";
import { CopyButton } from "../components/CopyButton";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { http } from "react-invenio-forms";

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
    const { record, defaultStyle, includeDeleted } = this.props;
    this.getCitation(record, defaultStyle, includeDeleted);
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
    return <Message negative>{message}</Message>;
  };

  fetchCitation = async (record, style, includeDeleted) => {
    const includeDeletedParam = includeDeleted === true ? "&include_deleted=1" : "";
    const url = `${record.links.self}?locale=${navigator.language}&style=${style}${includeDeletedParam}`;
    return await http.get(url, {
      headers: {
        Accept: "text/x-bibliography",
      },
    });
  };

  getCitation = async (record, style, includeDeleted) => {
    this.setState({
      loading: true,
      citation: "",
      error: "",
    });

    this.cancellableFetchCitation = withCancel(
      this.fetchCitation(record, style, includeDeleted)
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
          error: i18next.t("An error occurred while generating the citation."),
        });
      }
    }
  };

  render() {
    const { styles, record, defaultStyle, includeDeleted } = this.props;
    const { loading, citation, error } = this.state;
    const citationOptions = styles.map((style) => {
      return {
        key: style[0],
        value: style[0],
        text: style[1],
      };
    });

    // convert links in text to clickable links (ignoring punctuations at the end)
    const escapedCitation = _escape(citation); // escape html characters
    const urlRegex = /(https?:\/\/[^\s,;]+(?=[^\s,;]*))/g;
    const urlizedCitation = escapedCitation.replace(urlRegex, (url) => {
      // remove trailing dot
      let trailingDot = "";
      if (url.endsWith(".")) {
        trailingDot = ".";
        url = url.slice(0, -1);
      }
      return `<a href="${url}" target="_blank">${url}</a>${trailingDot}`;
    });

    return (
      <div>
        <div id="citation-text" className="wrap-overflowing-text rel-mb-2">
          {loading ? (
            this.placeholderLoader()
          ) : (
            <div dangerouslySetInnerHTML={{ __html: urlizedCitation }} />
          )}
        </div>

        <div className="auto-column-grid no-wrap">
          <div className="flex align-items-center">
            <label id="citation-style-label" className="mr-10">
              {i18next.t("Style")}
            </label>
            <Dropdown
              className="citation-dropdown"
              aria-labelledby="citation-style-label"
              defaultValue={defaultStyle}
              options={citationOptions}
              selection
              onChange={_debounce(
                (event, data) => this.getCitation(record, data.value, includeDeleted),
                500
              )}
            />
          </div>
          <CopyButton text={citation} />
        </div>
        {error ? this.errorMessage(error) : null}
      </div>
    );
  }
}

RecordCitationField.propTypes = {
  styles: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  defaultStyle: PropTypes.string.isRequired,
  includeDeleted: PropTypes.bool.isRequired,
};
