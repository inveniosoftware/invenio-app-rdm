/*
 * This file is part of Invenio.
 * Copyright (C) 2023-2024 CERN.
 * Copyright (C) 2024 KTH Royal Institute of Technology.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Popup, Icon, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { timestampToRelativeTime } from "../../../utils";
import { AccessDropdown } from "./AccessDropdown";
import _truncate from "lodash/truncate";
import { isEmpty } from "lodash";
import { withCancel, http, ErrorMessage } from "react-invenio-forms";

export const LinksSearchItem = ({
  result,
  record,
  onItemAddedOrDeleted,
  onPermissionChanged,
  dropdownOptions,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  var cancellableAction = undefined;

  useEffect(() => {
    return () => {
      cancellableAction && cancellableAction.cancel();
    };
  }, [cancellableAction]);

  const handleDelete = async () => {
    setLoading(true);
    cancellableAction = withCancel(
      http.delete(`${record.links.access_links}/${result.id}`)
    );
    try {
      await cancellableAction.promise;
      setLoading(false);
      onItemAddedOrDeleted(record.links.access_links, "links");
    } catch (error) {
      setLoading(false);
      setError(error);
      console.error(error);
    }
  };

  const copyButtonRef = React.createRef();

  useEffect(() => {
    copyButtonRef.current?.focus(); // Accessiblity: focus the copy-button when modal opens
  }, [copyButtonRef]);

  useEffect(() => {
    let popupTimeout = setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      clearTimeout(popupTimeout);
    };
  }, [copied]);

  const copyAccessLink = () => {
    let selfLink = "";

    if (result?.permission === "view") {
      // point to `/records/<id>` even for drafts
      selfLink = `${record.links.record_html || record.links.self_html}?`;
    } else if (result?.permission === "preview") {
      // point to `/records/<id>?preview=1` even for published records
      selfLink = `${record.links.preview_html}&`;
    } else if (result?.permission === "edit") {
      selfLink = `${record.links.self_html}?`;
    }

    const accessLink = `${selfLink}token=${result.token}`;
    navigator.clipboard.writeText(accessLink);
    setCopied(true);
  };

  return (
    <Table.Row key={result.id}>
      {error && (
        <ErrorMessage
          header={i18next.t("Something went wrong")}
          content={error?.response?.data?.message || error.message}
          icon="exclamation"
          negative
          size="mini"
        />
      )}

      {!error && (
        <>
          <Table.Cell width={3} data-label={i18next.t("Link title")}>
            {isEmpty(result.description)
              ? "-"
              : _truncate(result.description, { length: 60 })}
          </Table.Cell>
          <Table.Cell width={3} data-label={i18next.t("Created")}>
            {timestampToRelativeTime(result.created_at)}
          </Table.Cell>
          <Table.Cell width={3} data-label={i18next.t("Expires at")}>
            {isEmpty(result.expires_at)
              ? i18next.t("Never")
              : `${timestampToRelativeTime(result.expires_at)} (${result.expires_at})`}
          </Table.Cell>
          <Table.Cell width={3} data-label={i18next.t("Access")}>
            <AccessDropdown
              updateEndpoint={`${record.links.access_links}/${result.id}`}
              dropdownOptions={dropdownOptions}
              result={result}
              onPermissionChanged={onPermissionChanged}
              entityType="links"
            />
          </Table.Cell>
          <Table.Cell width={4}>
            <Button
              loading={loading}
              disabled={loading}
              onClick={handleDelete}
              icon
              labelPosition="left"
              negative
              size="small"
            >
              <Icon name="trash" />
              {i18next.t("Delete")}
            </Button>
            <Popup
              position="top center"
              content={i18next.t("Copied!")}
              inverted
              open={copied}
              on="click"
              size="small"
              trigger={
                <Button
                  ref={copyButtonRef}
                  onClick={() => copyAccessLink(result?.id)}
                  aria-label={i18next.t("Copy link")}
                  size="small"
                  icon
                  labelPosition="left"
                >
                  <Icon name="copy outline" />
                  {i18next.t("Copy link")}
                </Button>
              }
            />
          </Table.Cell>
        </>
      )}
    </Table.Row>
  );
};

LinksSearchItem.propTypes = {
  result: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  onItemAddedOrDeleted: PropTypes.func.isRequired,
  onPermissionChanged: PropTypes.func.isRequired,
  dropdownOptions: PropTypes.array.isRequired,
};
