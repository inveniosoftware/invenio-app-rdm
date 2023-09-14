/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
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
import { withCancel, http } from "react-invenio-forms";

export const LinksSearchItem = ({ result, record, fetchData }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
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
      fetchData();
    } catch (error) {
      setLoading(false);
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
    const accessLink = `${record.links.self_html}?token=${result.token}`;
    navigator.clipboard.writeText(accessLink);
    setCopied(true);
  };

  return (
    <Table.Row key={result.id}>
      <Table.Cell width={3} data-label="Link title">
        {isEmpty(result.description)
          ? "-"
          : _truncate(result.description, { length: 60 })}
      </Table.Cell>
      <Table.Cell width={3} data-label="Created">
        {timestampToRelativeTime(result.created_at)}
      </Table.Cell>
      <Table.Cell width={3} data-label="Expires at">
        {isEmpty(result.expires_at)
          ? i18next.t("Never")
          : `${timestampToRelativeTime(result.expires_at)} (${result.expires_at})`}
      </Table.Cell>
      <Table.Cell width={3} data-label="Access">
        <AccessDropdown record={record} result={result} />
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
    </Table.Row>
  );
};

LinksSearchItem.propTypes = {
  result: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  fetchData: PropTypes.func.isRequired,
};
