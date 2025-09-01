/*
 * This file is part of Invenio.
 * Copyright (C) 2025 CERN.
 *
 * InvenioAppRdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes.js";
import { UserListItemCompact, toRelativeTime } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SearchResultItemComponent extends Component {
  refreshAfterAction = () => {
    const { updateQueryState, currentQueryState } = this.props;
    updateQueryState(currentQueryState);
  };

  render() {
    const { result, columns, idKeyPath, listUIEndpoint } = this.props;
    return (
      <Table.Row>
        <Table.Cell
          key={`${columns[0][1]["text"]}-${columns[0][1]["order"]}`}
          data-label={columns[0][1]["text"]}
          className="word-break-all"
        >
          <a href={AdminUIRoutes.detailsView(listUIEndpoint, result, idKeyPath)}>
            {/* TODO we need a better way to get the (translatable) label of a request type
            https://github.com/inveniosoftware/invenio-requests/issues/414 */}
            {result.type === "record-deletion" && "Record deletion"}
          </a>
        </Table.Cell>
        <Table.Cell
          key={`${columns[1][1]["text"]}-${columns[1][1]["order"]}`}
          data-label={columns[1][1]["text"]}
          className="word-break-all"
        >
          <UserListItemCompact
            user={result.expanded.created_by}
            id={result.created_by.user}
            // TODO linkToDetailView= filter by user?
          />
          {toRelativeTime(result.created)}
        </Table.Cell>
        <Table.Cell
          key={`${columns[2][1]["text"]}-${columns[2][1]["order"]}`}
          data-label={columns[2][1]["text"]}
          className="word-break-all"
        >
          {result.expanded.last_reply ? (
            <>
              <UserListItemCompact
                user={result.expanded.last_reply.created_by}
                id={result.last_reply.created_by.user}
              />
              {toRelativeTime(result.last_reply.created)}
            </>
          ) : (
            i18next.t("No replies")
          )}
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  result: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
};

export const SearchResultItem = withState(SearchResultItemComponent);
