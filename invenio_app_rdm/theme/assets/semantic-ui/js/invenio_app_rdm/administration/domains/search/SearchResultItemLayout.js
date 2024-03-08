/*
 * This file is part of Invenio.
 * Copyright (C) 2022-2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter, Actions } from "@js/invenio_administration";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table, Dropdown, Icon, Button } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";
import { i18next } from "@translations/invenio_app_rdm/i18next";

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
      displayEdit,
      displayDelete,
      actions,
      idKeyPath,
      listUIEndpoint,
    } = this.props;

    return (
      <Table.Row>
        {/*<Table.Cell>*/}
        {/*We pass user ID to bulk actions - user moderation API takes user IDs*/}
        {/*<SearchResultsRowCheckbox rowId={userId} data={result} />*/}
        {/*</Table.Cell>*/}
        <Table.Cell key={`domain-column-${result.id}`} data-label={i18next.t("Domain")}>
          <a href={result.links.admin_self_html}>{result.domain}</a> &nbsp;
          <BoolFormatter
            tooltip={i18next.t("Flagged")}
            icon="flag"
            color="red"
            value={result.flagged}
          />
          <BoolFormatter
            tooltip={i18next.t("Organization")}
            icon="university"
            color="black"
            value={result.status_name === "organization"}
          />
          <BoolFormatter
            tooltip={i18next.t("Company")}
            icon="building outline"
            color="black"
            value={result.category_name === "company"}
          />
          <BoolFormatter
            tooltip={i18next.t("Mail provider")}
            icon="mail outline"
            color="black"
            value={result.status_name === "mail-provider"}
          />
          <BoolFormatter
            tooltip={i18next.t("Spammer")}
            icon="warning"
            color="yellow"
            value={result.status_name === "spammer"}
          />
        </Table.Cell>
        <Table.Cell key={`domain-tld-${result.id}`} data-label={i18next.t("TLD")}>
          {result.tld}
        </Table.Cell>
        <Table.Cell key={`domain-status-${result.id}`} data-label={i18next.t("Status")}>
          <BoolFormatter
            tooltip={i18next.t("New")}
            icon="hourglass end"
            color="grey"
            value={result.status_name === "new"}
          />
          <BoolFormatter
            tooltip={i18next.t("Moderated")}
            icon="eye"
            color="grey"
            value={result.status_name === "moderated"}
          />
          <BoolFormatter
            tooltip={i18next.t("Verified")}
            icon="check"
            color="green"
            value={result.status_name === "verified"}
          />
          <BoolFormatter
            tooltip={i18next.t("Blocked")}
            icon="ban"
            color="red"
            value={result.status_name === "blocked"}
          />
        </Table.Cell>
        <Table.Cell key={`domain-users-${result.id}`} data-label={i18next.t("Users")}>
          {result.num_users}
        </Table.Cell>
        <Table.Cell key={`domain-active-${result.id}`} data-label={i18next.t("Active")}>
          {result.num_active}
        </Table.Cell>
        <Table.Cell
          key={`domain-inactive-${result.id}`}
          data-label={i18next.t("Inactive")}
        >
          {result.num_inactive}
        </Table.Cell>
        <Table.Cell
          key={`domain-confirmed-${result.id}`}
          data-label={i18next.t("Confirmed")}
        >
          {result.num_confirmed}
        </Table.Cell>
        <Table.Cell
          key={`domain-verified-${result.id}`}
          data-label={i18next.t("Verified")}
        >
          {result.num_verified}
        </Table.Cell>
        <Table.Cell
          key={`domain-blocked-${result.id}`}
          data-label={i18next.t("Blocked")}
        >
          {result.num_blocked}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`domain-links-${result.id}`}
          data-label={i18next.t("Links")}
          className="word-break-all"
        >
          <Dropdown text={<Icon name="eye" />}>
            <Dropdown.Menu>
              <Dropdown.Item
                text={i18next.t("Users")}
                onClick={() => (window.location = result.links.admin_users_html)}
              />
            </Dropdown.Menu>
          </Dropdown>
        </Table.Cell>
        <Table.Cell collapsing>
          <Button.Group size="tiny" basic widths={5} compact className="margined">
            <Actions
              title={title}
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
          </Button.Group>
        </Table.Cell>
      </Table.Row>
    );
  }
}

SearchResultItemComponent.propTypes = {
  actions: PropTypes.object.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  displayDelete: PropTypes.bool.isRequired,
  displayEdit: PropTypes.bool.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  result: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  updateQueryState: PropTypes.func.isRequired,
};

SearchResultItemComponent.defaultProps = {};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
