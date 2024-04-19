/*
 * This file is part of Invenio.
 * Copyright (C) 2022-2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter, DateFormatter } from "@js/invenio_administration";
import { UserActions } from "../UserActions";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table, Dropdown, Icon } from "semantic-ui-react";
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
    const { result, idKeyPath, listUIEndpoint } = this.props;

    return (
      <Table.Row>
        {/*<Table.Cell>*/}
        {/*We pass user ID to bulk actions - user moderation API takes user IDs*/}
        {/*<SearchResultsRowCheckbox rowId={userId} data={result} />*/}
        {/*</Table.Cell>*/}
        <Table.Cell key={`user-column-${result.id}`} data-label={i18next.t("User")}>
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
        <Table.Cell key={`user-name-${result.id}`} data-label={i18next.t("Username")}>
          @{result.username}
          {result.identities.orcid && (
            <img
              className="inline-id-icon ml-5"
              src="/static/images/orcid.svg"
              alt="ORCID"
            />
          )}
          <BoolFormatter
            tooltip={i18next.t("GitHub")}
            icon="github"
            color="black"
            value={result.identities.github}
          />
        </Table.Cell>
        <Table.Cell
          key={`user-email-${result.id}`}
          data-label={i18next.t("Email")}
          collapsing
          className="word-break-all"
        >
          <BoolFormatter
            tooltip={i18next.t("New")}
            icon="hourglass end"
            color="grey"
            value={result.domaininfo.status === 1}
          />
          <BoolFormatter
            tooltip={i18next.t("Moderated")}
            icon="eye"
            color="grey"
            value={result.domaininfo.status === 2}
          />
          <BoolFormatter
            tooltip={i18next.t("Verified")}
            icon="check"
            color="green"
            value={result.domaininfo.status === 3}
          />
          <BoolFormatter
            tooltip={i18next.t("Blocked")}
            icon="ban"
            color="red"
            value={result.domaininfo.status === 4}
          />
          {result.email}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-status-${result.id}`}
          data-label={i18next.t("Status")}
          className="word-break-all"
        >
          <BoolFormatter
            tooltip={i18next.t("Verified")}
            icon="star"
            color="yellow"
            value={result.status === "verified"}
          />
          <BoolFormatter
            tooltip={i18next.t("Confirmed")}
            icon="check"
            color="green"
            value={result.status === "confirmed"}
          />
          <BoolFormatter
            tooltip={i18next.t("New")}
            icon="hourglass"
            color="grey"
            value={result.status === "new"}
          />
          <BoolFormatter
            tooltip={i18next.t("Inactive")}
            icon="times"
            color="red"
            value={result.status === "inactive"}
          />
          <BoolFormatter
            tooltip={i18next.t("Blocked")}
            icon="ban"
            color="red"
            value={result.status === "blocked"}
          />
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-created-${result.id}`}
          data-label={i18next.t("Created")}
          className="word-break-all"
        >
          <DateFormatter value={result.created} />
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-updated-${result.id}`}
          data-label={i18next.t("Updated")}
          className="word-break-all"
        >
          <DateFormatter value={result.updated} />
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`user-links-${result.id}`}
          data-label={i18next.t("Links")}
          className="word-break-all"
        >
          <Dropdown text={<Icon name="eye" />}>
            <Dropdown.Menu>
              <Dropdown.Item
                text="Records"
                onClick={() => (window.location = result.links.admin_records_html)}
              />
              <Dropdown.Item
                text="Drafts"
                onClick={() => (window.location = result.links.admin_drafts_html)}
              />
              <Dropdown.Item
                text="Moderation"
                onClick={() => (window.location = result.links.admin_moderation_html)}
              />
            </Dropdown.Menu>
          </Dropdown>
        </Table.Cell>
        <Table.Cell collapsing>
          <UserActions
            useDropdown
            user={result}
            successCallback={this.refreshAfterAction}
            displayImpersonateUser
            displayQuota
          />
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
