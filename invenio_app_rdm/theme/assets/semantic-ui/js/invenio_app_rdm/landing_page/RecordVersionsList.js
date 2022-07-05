// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _get from "lodash/get";
import React, { useEffect, useState } from "react";
import { Grid, Icon, Message, Placeholder, List, Divider } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

const deserializeRecord = (record) => ({
  id: record.id,
  parent_id: record.parent.id,
  publication_date: record.ui.publication_date_l10n_medium,
  version: record.ui.version,
  links: record.links,
  pids: record.pids,
});

const NUMBER_OF_VERSIONS = 5;

const RecordVersionItem = ({ item, activeVersion }) => {
  const doi = _get(item.pids, "doi.identifier", "");
  return (
    <List.Item key={item.id} {...(activeVersion && { className: "version active" })}>
      <List.Content floated="left">
        {activeVersion ? (
          <span>
            {i18next.t("Version")} {item.version}
          </span>
        ) : (
          <a href={`/records/${item.id}`}>
            {i18next.t("Version")} {item.version}
          </a>
        )}

        {doi && (
          <small
            className={"doi" + (activeVersion ? " text-muted-darken" : " text-muted")}
          >
            {doi}
          </small>
        )}
      </List.Content>

      <List.Content floated="right">
        <small className={activeVersion ? "text-muted-darken" : "text-muted"}>
          {item.publication_date}
        </small>
      </List.Content>
    </List.Item>
  );
};

RecordVersionItem.propTypes = {
  item: PropTypes.object.isRequired,
  activeVersion: PropTypes.bool.isRequired,
};

const PlaceholderLoader = ({ size }) => {
  const PlaceholderItem = () => (
    <Placeholder.Header>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>
  );
  let numberOfHeader = [];
  for (let i = 0; i < size; i++) {
    numberOfHeader.push(<PlaceholderItem key={i} />);
  }

  return <Placeholder>{numberOfHeader}</Placeholder>;
};

PlaceholderLoader.propTypes = {
  size: PropTypes.number,
};

PlaceholderLoader.defaultProps = {
  size: NUMBER_OF_VERSIONS,
};

const PreviewMessage = () => {
  return (
    <Grid className="container">
      <Grid.Row>
        <Grid.Column className="p-0">
          <Message info>
            <Message.Header>
              <Icon name="eye" />
              {i18next.t("Preview")}
            </Message.Header>
            <p>{i18next.t("Only published versions are displayed.")}</p>
          </Message>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export const RecordVersionsList = ({ record, isPreview }) => {
  const recordDeserialized = deserializeRecord(record);
  const recid = recordDeserialized.id;
  const [loading, setLoading] = useState(true);
  const [currentRecordInResults, setCurrentRecordInResults] = useState(false);
  const [recordVersions, setRecordVersions] = useState({});

  useEffect(() => {
    async function fetchVersions() {
      const result = await axios(
        `${recordDeserialized.links.versions}?size=${NUMBER_OF_VERSIONS}&sort=version&allversions=true`,
        {
          headers: {
            Accept: "application/vnd.inveniordm.v1+json",
          },
          withCredentials: true,
        }
      );
      let { hits, total } = result.data.hits;
      hits = hits.map(deserializeRecord);
      setCurrentRecordInResults(hits.some((record) => record.id === recid));
      setRecordVersions({ hits, total });
      setLoading(false);
    }
    fetchVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading ? (
    isPreview ? (
      <PreviewMessage />
    ) : (
      <PlaceholderLoader />
    )
  ) : (
    <List divided>
      {isPreview ? <PreviewMessage /> : null}
      {recordVersions.hits.map((item) => (
        <RecordVersionItem
          key={item.id}
          item={item}
          activeVersion={item.id === recid}
        />
      ))}
      {!currentRecordInResults && (
        <>
          <Divider horizontal>...</Divider>
          <RecordVersionItem item={recordDeserialized} activeVersion />
        </>
      )}
      {recordVersions.total > 1 && (
        <Grid className="mt-0">
          <Grid.Row centered>
            <a
              href={`/search?q=parent.id:${recordDeserialized.parent_id}&sort=version&f=allversions:true`}
              className="font-small"
            >
              {i18next.t(`View all {{total}} versions`, {
                total: recordVersions.total,
              })}
            </a>
          </Grid.Row>
        </Grid>
      )}
    </List>
  );
};

RecordVersionsList.propTypes = {
  record: PropTypes.object.isRequired,
  isPreview: PropTypes.bool.isRequired,
};
