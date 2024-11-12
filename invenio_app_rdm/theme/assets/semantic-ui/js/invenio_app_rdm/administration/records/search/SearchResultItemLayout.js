/*
 * This file is part of Invenio.
 * Copyright (C) 2023-2024 CERN.
 * Copyright (C) 2024      KTH Royal Institute of Technology.
 * Copyright (C) 2024      Northwestern University.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter } from "@js/invenio_administration";
import { UserActions } from "../../users/UserActions";
import { RecordActions } from "../RecordActions";
import _truncate from "lodash/truncate";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Popup, Table, Button } from "semantic-ui-react";
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

    /* TODO needs to be expanded */
    // May be null/undefined if System record
    // TODO: account for that
    // See  https://github.com/inveniosoftware/invenio-app-rdm/issues/2849
    const recordOwner = result?.parent?.access?.owned_by;

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
          <a target="_blank" rel="noreferrer noopener" href={result.links.self_html}>
            {_truncate(result.metadata.title || i18next.t("Empty draft title"), {
              length: 100,
            })}
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
          {recordOwner ? (
            <a href={`/administration/users?q=id:${recordOwner.user}`}>
              {recordOwner.user}
            </a>
          ) : (
            i18next.t("System")
          )}
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
          {result.files.count} file{result.files.count !== 1 ? "s" : ""}:{" "}
          {humanReadableBytes(result.files.total_bytes, true)}
        </Table.Cell>
        <Table.Cell
          collapsing
          key={`record-stats-${result.id}`}
          data-label={i18next.t("Stats")}
          className="word-break-all"
        >
          <Popup
            content="views | downloads"
            trigger={
              <span>
                {result?.stats?.all_versions?.unique_views ?? 0} |{" "}
                {result?.stats?.all_versions?.unique_downloads ?? 0}
              </span>
            }
          />
        </Table.Cell>

        <Table.Cell collapsing>
          <Button.Group basic widths={5} compact className="margined">
            <RecordActions
              record={result}
              displayQuota={!result.is_published}
              title={title}
              resourceName={resourceName}
              editUrl={AdminUIRoutes.editView(listUIEndpoint, result, idKeyPath)}
              displayEdit={displayEdit}
              displayDelete={displayDelete}
              actions={actions}
              idKeyPath={idKeyPath}
              successCallback={this.refreshAfterAction}
              listUIEndpoint={listUIEndpoint}
            />
            {recordOwner && recordOwner.user && (
              <UserActions
                user={{ id: recordOwner.user }}
                displaySuspend
                displayBlock
                useDropdown
                successCallback={this.refreshAfterAction}
              />
            )}
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
