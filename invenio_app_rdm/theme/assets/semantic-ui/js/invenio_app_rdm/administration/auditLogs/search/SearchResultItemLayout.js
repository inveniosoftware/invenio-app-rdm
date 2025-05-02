/*
 * This file is part of Invenio.
 * Copyright (C) 2025 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SearchResultItemComponent extends Component {
  componentDidMount() {
    console.error("result", this.props.result);
  }

  refreshAfterAction = () => {
    const { updateQueryState, currentQueryState } = this.props;
    updateQueryState(currentQueryState);
  };

  render() {
    const { result } = this.props;

    const {
      id,
      created,
      action,
      resource: { id: resourceId, type: resourceType },
      user: { id: userId, email: userEmail },
    } = result;

    return (
      <Table.Row>
        <Table.Cell data-label={i18next.t("Log ID")}>
          <a target="_blank" rel="noreferrer noopener" href={result.links.self}>
            {id}
          </a>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Resource")}>{resourceType}</Table.Cell>
        <Table.Cell data-label={i18next.t("Resource ID")}>
          <a href={`/administration/${resourceType}s?q=id:${resourceId}`}>
            {resourceId}
          </a>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Action")}>{action}</Table.Cell>
        <Table.Cell data-label={i18next.t("User")}>
          <a href={`/administration/users?q=id:${userId}`}>
            {userId} ({userEmail})
          </a>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Date")}>{created}</Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  result: PropTypes.object.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
