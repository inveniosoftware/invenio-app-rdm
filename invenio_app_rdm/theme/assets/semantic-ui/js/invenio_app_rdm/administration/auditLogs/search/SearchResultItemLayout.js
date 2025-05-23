/*
 * This file is part of Invenio.
 * Copyright (C) 2025 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import { Button, Item, Table } from "semantic-ui-react";
import { Image, toRelativeTime } from "react-invenio-forms";
import { withState } from "react-searchkit";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Actions } from "@js/invenio_administration";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";

class SearchResultItemComponent extends Component {
  refreshAfterAction = () => {
    const { updateQueryState, currentQueryState } = this.props;
    updateQueryState(currentQueryState);
  };

  render() {
    const { title, resourceName, result, actions, idKeyPath, listUIEndpoint } =
      this.props;

    const {
      created,
      action,
      resource: { id: resourceId, type: resourceType },
      user: { id: userId, email: userEmail },
    } = result;

    return (
      <Table.Row>
        <Table.Cell data-label={i18next.t("Resource")}>{resourceType}</Table.Cell>
        <Table.Cell data-label={i18next.t("Resource ID")}>
          <a target="_blank" rel="noreferrer noopener" href={`/uploads/${resourceId}`}>
            {resourceId}
          </a>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Action")}>{action}</Table.Cell>
        <Table.Cell data-label={i18next.t("User")}>
          <Item className="flex" key={userId}>
            <Image src={`/api/users/${userId}/avatar.svg`} avatar loadFallbackFirst />
            <a href={`/administration/users?q=id:${userId}`}>{userEmail}</a>
          </Item>
        </Table.Cell>
        <Table.Cell data-label={i18next.t("Created")}>
          {toRelativeTime(created)}
        </Table.Cell>

        {/* Actions */}
        <Table.Cell collapsing>
          <Button.Group size="tiny" basic widths={5} compact className="margined">
            <Actions
              title={title}
              resourceName={resourceName}
              editUrl={AdminUIRoutes.editView(listUIEndpoint, result, idKeyPath)}
              displayEdit={false}
              displayDelete={false}
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
  result: PropTypes.object.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
