/*
 * This file is part of Invenio.
 * Copyright (C) 2022 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter } from "@js/invenio_administration";
import { UserActions } from "../UserActions";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import isEmpty from "lodash/isEmpty";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";
import { UserListItemCompact, SearchResultsRowCheckbox } from "react-invenio-forms";

class SearchResultItemComponent extends Component {
  refreshAfterAction = () => {
    const { updateQueryState, currentQueryState } = this.props;
    updateQueryState(currentQueryState);
  };

  render() {
    const { result, idKeyPath, listUIEndpoint } = this.props;

    return (
      <Table.Row>
        {/*<Table.Cell>*/}
        {/*We pass user ID to bulk actions - user moderation API takes user IDs*/}
        {/*<SearchResultsRowCheckbox rowId={userId} data={result} />*/}
        {/*</Table.Cell>*/}
        <Table.Cell
          key={`user-column-${result.id}`}
          data-label="Username"
          className="word-break-all"
        >
          <UserListItemCompact
            user={result}
            id={result.id}
            linkToDetailView={AdminUIRoutes.detailsView(
              listUIEndpoint,
              result,
              idKeyPath
            )}
          />
        </Table.Cell>
        <Table.Cell
          key={`user-email-${result.id}`}
          data-label="Email"
          collapsing
          className="word-break-all"
        >
          {result.email}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-active-${result.id}`}
          data-label="Active"
          className="word-break-all"
        >
          <BoolFormatter icon="check" color="green" value={result.active} />
          <BoolFormatter icon="close" color="red" value={!result.active} />
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-confirmed-${result.id}`}
          data-label="Confirmed"
          className="word-break-all"
        >
          {result.confirmed_at}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-verified-${result.id}`}
          data-label="Verified at"
          className="word-break-all"
        >
          {result.verified_at}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-blocked-${result.id}`}
          data-label="Blocked at"
          className="word-break-all"
        >
          {result.blocked_at}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-created-${result.id}`}
          data-label="Created"
          className="word-break-all"
        >
          {result.created}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-updated-${result.id}`}
          data-label="Updated"
          className="word-break-all"
        >
          {result.updated}
        </Table.Cell>

        <Table.Cell collapsing>
          <UserActions user={result} successCallback={this.refreshAfterAction} />
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  result: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
};

SearchResultItemComponent.defaultProps = {};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
