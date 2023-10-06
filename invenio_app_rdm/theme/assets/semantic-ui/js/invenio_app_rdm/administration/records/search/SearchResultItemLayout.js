/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter, Actions } from "@js/invenio_administration";
import { SetQuotaAction } from "../../components/SetQuotaAction";
import { UserActions } from "../../users/UserActions";
import _truncate from "lodash/truncate";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table, Button } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";
import { humanReadableBytes, toRelativeTime } from "react-invenio-forms";
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
        <Table.Cell
          key={`record-title-${result.id}`}
          data-label="Title"
          className="word-break-all"
        >
          <BoolFormatter
            value={result.access.record === "public"}
            color="green"
            icon="lock unlocked"
          />
          <BoolFormatter
            value={
              result.access.record === "restricted" ||
              result.access.files === "restricted"
            }
            color="red"
            icon="lock"
          />
          <a target="_blank" rel="noreferrer" href={result.links.self_html}>
            {_truncate(result.metadata.title, { length: 50 })}
          </a>
          <br />
          <div className="text-muted">
            {result.id} | {i18next.t("version")} {result.versions.index}
          </div>
        </Table.Cell>
        <Table.Cell
          key={`record-owner-${result.id}`}
          data-label={i18next.t("Owner")}
          collapsing
          className="word-break-all"
        >
          {/* TODO needs to be expanded */}
          {result.parent.access.owned_by.user}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`record-created-${result.id}`}
          data-label={i18next.t("Created")}
          className="word-break-all"
        >
          {toRelativeTime(result.created)}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`record-files-${result.id}`}
          data-label={i18next.t("Files")}
          className="word-break-all"
        >
          {humanReadableBytes(result.files.total_bytes)} | #{result.files.count}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`record-stats-${result.id}`}
          data-label={i18next.t("Stats")}
          className="word-break-all"
        >
          {result.stats.all_versions.unique_views} |{" "}
          {result.stats.all_versions.unique_downloads}
        </Table.Cell>

        <Table.Cell collapsing>
          <Button.Group basic widths={5} compact className="margined">
            {!result.is_published && (
              <SetQuotaAction
                successCallback={this.refreshAfterAction}
                apiUrl={`/api/records/${result.id}/quota`}
                resource={result}
              />
            )}
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
            <UserActions
              user={{ id: result.parent.access.owned_by.user }}
              displaySuspend
              displayBlock
              successCallback={this.refreshAfterAction}
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
  displayEdit: PropTypes.bool,
  displayDelete: PropTypes.bool,
  actions: PropTypes.object.isRequired,
};

SearchResultItemComponent.defaultProps = { displayEdit: false, displayDelete: false };

export const SearchResultItemLayout = withState(SearchResultItemComponent);
