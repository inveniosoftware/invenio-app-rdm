// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { Component } from "react";
import Overridable from "react-overridable";
import { SearchItemCreators } from "../utils";
import PropTypes from "prop-types";
import { Item, Label, Icon } from "semantic-ui-react";
import { buildUID } from "react-searchkit";
import { CompactStats } from "./CompactStats";

class RecordsResultsListItem extends Component {
  render() {
    const { currentQueryState, result, key, appName } = this.props;

    const accessStatusId = _get(result, "ui.access_status.id", "open");
    const accessStatus = _get(result, "ui.access_status.title_l10n", "Open");
    const accessStatusIcon = _get(result, "ui.access_status.icon", "unlock");
    const createdDate = _get(
      result,
      "ui.created_date_l10n_long",
      "No creation date found."
    );
    const creators = result.ui.creators.creators.slice(0, 3);

    const descriptionStripped = _get(
      result,
      "ui.description_stripped",
      "No description"
    );

    const publicationDate = _get(
      result,
      "ui.publication_date_l10n_long",
      "No publication date found."
    );
    const resourceType = _get(
      result,
      "ui.resource_type.title_l10n",
      "No resource type"
    );
    const subjects = _get(result, "ui.subjects", []);
    const title = _get(result, "metadata.title", "No title");
    const version = _get(result, "ui.version", null);
    const versions = _get(result, "versions");
    const uniqueViews = _get(result, "stats.all_versions.unique_views", 0);
    const uniqueDownloads = _get(result, "stats.all_versions.unique_downloads", 0);

    const publishingInformation = _get(result, "ui.publishing_information.journal", "");

    const filters = currentQueryState && Object.fromEntries(currentQueryState.filters);
    const allVersionsVisible = filters?.allversions;
    const numOtherVersions = versions.index - 1;

    // Derivatives
    const viewLink = `/records/${result.id}`;
    return (
      <Overridable
        id={buildUID("RecordsResultsListItem.layout", "", appName)}
        result={result}
        key={key}
        accessStatusId={accessStatusId}
        accessStatus={accessStatus}
        accessStatusIcon={accessStatusIcon}
        createdDate={createdDate}
        creators={creators}
        descriptionStripped={descriptionStripped}
        publicationDate={publicationDate}
        resourceType={resourceType}
        subjects={subjects}
        title={title}
        version={version}
        versions={versions}
        allVersionsVisible={allVersionsVisible}
        numOtherVersions={numOtherVersions}
      >
        <Item key={key ?? result.id}>
          <Item.Content>
            <Item.Extra className="labels-actions">
              <Label horizontal size="small" className="primary">
                {publicationDate} ({version})
              </Label>
              <Label horizontal size="small" className="neutral">
                {resourceType}
              </Label>
              <Label
                horizontal
                size="small"
                className={`access-status ${accessStatusId}`}
              >
                {accessStatusIcon && <Icon name={accessStatusIcon} />}
                {accessStatus}
              </Label>
            </Item.Extra>
            <Item.Header as="h2">
              <a href={viewLink}>{title}</a>
            </Item.Header>
            <Item className="creatibutors">
              <SearchItemCreators creators={creators} />
            </Item>
            <Item.Description>
              {_truncate(descriptionStripped, { length: 350 })}
            </Item.Description>
            <Item.Extra>
              {subjects.map((subject) => (
                <Label key={subject.title_l10n} size="tiny">
                  {subject.title_l10n}
                </Label>
              ))}

              <div className="flex justify-space-between align-items-end">
                <small>
                  <p>
                    {createdDate && (
                      <>
                        {i18next.t("Uploaded on {{uploadDate}}", {
                          uploadDate: createdDate,
                        })}
                      </>
                    )}
                    {createdDate && publishingInformation && " | "}

                    {publishingInformation && (
                      <>
                        {i18next.t("Published in: {{publishInfo}}", {
                          publishInfo: publishingInformation,
                        })}
                      </>
                    )}
                  </p>

                  {!allVersionsVisible && versions.index > 1 && (
                    <p>
                      <b>
                        {i18next.t("{{count}} more versions exist for this record", {
                          count: numOtherVersions,
                        })}
                      </b>
                    </p>
                  )}
                </small>

                <small>
                  <CompactStats
                    uniqueViews={uniqueViews}
                    uniqueDownloads={uniqueDownloads}
                  />
                </small>
              </div>
            </Item.Extra>
          </Item.Content>
        </Item>
      </Overridable>
    );
  }
}

RecordsResultsListItem.propTypes = {
  currentQueryState: PropTypes.object,
  result: PropTypes.object.isRequired,
  key: PropTypes.string,
  appName: PropTypes.string,
};

RecordsResultsListItem.defaultProps = {
  key: null,
  currentQueryState: null,
  appName: "",
};

export default Overridable.component("RecordsResultsListItem", RecordsResultsListItem);
