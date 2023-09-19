/*
 * This file is part of Invenio.
 * Copyright (C) 2022 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter } from "@js/invenio_administration";
import { ModerationActions } from "../ModerationActions";
import { UserActions } from "../../users/UserActions";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table, Icon } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";
import { UserListItemCompact } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SearchResultItemComponent extends Component {
  refreshAfterAction = () => {
    const { updateQueryState, currentQueryState } = this.props;
    updateQueryState(currentQueryState);
  };

  render() {
    const {
      title,
      result,
      idKeyPath,
      listUIEndpoint,
      resourceHasActions,
      resourceName,
      displayEdit,
      displayDelete,
      actions,
    } = this.props;

    const {
      expanded: { topic: user },
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
          data-label={i18next.t("User")}
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
          data-label={i18next.t("Email")}
          collapsing
          className="word-break-all"
        >
          {splitEmail[0]}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-email-domain-${result.id}`}
          data-label={i18next.t("Email domain")}
          className="word-break-all"
        >
          @{splitEmail[1]}
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Actions")}>
          {/* TEMPORARY */}
          <a
            href={encodeURI(
              `/administration/records?q=parent.access.owned_by.user:${user.id}`
            )}
          >
            <Icon name="paperclip" />
            Records
          </a>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Status")}>
          <BoolFormatter
            value={result.status === "submitted"}
            icon="hourglass"
            color="yellow"
          />
          <BoolFormatter value={result.status === "declined"} icon="ban" color="red" />
          <BoolFormatter
            value={result.status === "accepted"}
            icon="check"
            color="green"
          />
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
          {!result.is_open && (
            <UserActions user={user} successCallback={this.refreshAfterAction} />
          )}
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  result: PropTypes.object.isRequired,
  displayDelete: PropTypes.bool,
  displayEdit: PropTypes.bool,
  actions: PropTypes.object,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
  resourceHasActions: PropTypes.bool,
};

SearchResultItemComponent.defaultProps = {
  displayDelete: true,
  displayEdit: true,
  actions: {},
  resourceHasActions: false,
};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
