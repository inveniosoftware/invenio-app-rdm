/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2023 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Dropdown, http, withCancel } from "react-invenio-forms";
import { Dropdown as SUIDropdown } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export default class RemovalReasonsSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: undefined,
      loading: false,
      defaultOpt: undefined,
    };
  }

  componentDidMount() {
    this.fetchOptions();
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  fetchOptions = async () => {
    const { setFieldValue } = this.props;
    this.setState({ loading: true });
    const url = "/api/vocabularies/removalreasons";
    this.cancellableAction = withCancel(
      http.get(url, {
        headers: {
          Accept: "application/vnd.inveniordm.v1+json",
        },
      })
    );
    try {
      const response = await this.cancellableAction.promise;
      const options = response.data.hits.hits;

      const defaultOpt = options
        ? { text: options[0].title_l10n, value: options[0].id, key: options[0].id }
        : {};
      this.setState({
        options: options,
        loading: false,
        defaultOpt: defaultOpt,
      });
      setFieldValue("removal_reason", defaultOpt.value);
    } catch (e) {
      this.setState({ loading: false });
      console.error(e);
    }
  };

  render() {
    const { loading, options, defaultOpt } = this.state;

    if (loading) {
      return <SUIDropdown loading={loading} />;
    }

    return (
      <Dropdown
        required
        label={i18next.t("Unavailability statement")}
        options={options}
        fieldPath="removal_reason"
        defaultValue={defaultOpt}
        clearable={false}
      />
    );
  }
}

RemovalReasonsSelect.propTypes = {
  setFieldValue: PropTypes.func.isRequired,
};
