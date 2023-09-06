/*
 * This file is part of Invenio.
 * Copyright (C) 2022 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { ModerationActions } from "../ModerationActions";
import { UserActions } from "../../users/UserActions";
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
    const {
      title,
      resourceName,
      result,
      columns,
      displayEdit,
      displayDelete,
      actions,
      idKeyPath,
      resourceSchema,
      listUIEndpoint,
      resourceHasActions,
    } = this.props;

    console.log(columns, "-------------------------------------------------");
    console.log(result, "+++++++++++++++++++++++++++");
    console.log(resourceSchema, "+++++++++++++++++++++++++++");

    const {
      expanded: { topic: user },
      topic: { user: userId },
    } = result;
    const splitEmail = user.email.split("@");
    return (
      <Table.Row>
        {/*<Table.Cell>*/}
          {/*We pass user ID to bulk actions - user moderation API takes user IDs*/}
          {/*<SearchResultsRowCheckbox rowId={userId} data={result} />*/}
        {/*</Table.Cell>*/}
        <Table.Cell
          key={`user-column-${result.id}`}
          data-label="User"
          className="word-break-all"
        >
          <UserListItemCompact
            user={user}
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
          {splitEmail[0]}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-email-domain-${result.id}`}
          data-label="Email"
          className="word-break-all"
        >
          @{splitEmail[1]}
        </Table.Cell>

        <Table.Cell collapsing textAlign="right">
          {resourceHasActions && result.is_open && (
            <ModerationActions
              title={title}
              user={user}
              resourceName={resourceName}
              editUrl={AdminUIRoutes.editView(listUIEndpoint, result, idKeyPath)}
              displayEdit={displayEdit}
              displayDelete={displayDelete}
              actions={actions}
              resource={result}
              idKeyPath={idKeyPath}
              successCallback={this.refreshAfterAction}
              listUIEndpoint={listUIEndpoint}
            />
          )}
          {!result.is_open &&
            <UserActions user={user} successCallback={this.refreshAfterAction}/>
          }
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  result: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  displayDelete: PropTypes.bool,
  displayEdit: PropTypes.bool,
  actions: PropTypes.object,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  resourceSchema: PropTypes.object.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
};

SearchResultItemComponent.defaultProps = {
  displayDelete: true,
  displayEdit: true,
  actions: {},
};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
