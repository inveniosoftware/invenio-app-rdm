/*
 * This file is part of Invenio.
 * Copyright (C) 2023-2024 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table, Input, Dropdown, Button, Icon, Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { dropdownOptions } from "./LinksSearchResultContainer";

export class CreateAccessLink extends Component {
  constructor(props) {
    super(props);
    const { record } = this.props;
    const isDraft = record?.is_draft || record?.is_draft === null;
    this.state = {
      description: undefined,
      expiresAt: undefined,
      permission: isDraft ? dropdownOptions[1].key : dropdownOptions[0].key, // "can view" option is disabled for drafts
    };
  }

  render() {
    const { permission, expiresAt, description } = this.state;
    const { handleCreation, loading, dropdownOptions } = this.props;
    return (
      <Table.Row>
        <Table.Cell width={16}>
          <Grid>
            <Grid.Column width={4}>
              <Input
                id="access-request-description"
                onChange={(e, data) => this.setState({ description: data.value })}
                fluid
              />
              <label
                htmlFor="access-request-description"
                className="helptext mb-0 mt-10"
              >
                {i18next.t("Short name for your link (optional).")}
              </label>
            </Grid.Column>
            <Grid.Column width={4}>
              <Input
                id="access-request-expires-at"
                onChange={(e, data) => {
                  this.setState({ expiresAt: data.value });
                }}
                fluid
                placeholder={i18next.t("Expiration date format: YYYY-MM-DD")}
              />
              <label
                htmlFor="access-request-expires-at"
                className="helptext mb-0 mt-10"
              >
                {i18next.t("Expiration date: YYYY-MM-DD or never if blank (optional).")}
              </label>
            </Grid.Column>
            <Grid.Column width={4}>
              <Dropdown
                placeholder={i18next.t("Select permissions")}
                fluid
                selection
                onChange={(event, data) => this.setState({ permission: data.value })}
                options={dropdownOptions}
                defaultValue={permission}
              />
            </Grid.Column>

            <Grid.Column width={4} textAlign="right">
              <Button
                onClick={() => handleCreation(permission, expiresAt, description)}
                icon
                loading={loading}
                disabled={loading}
                labelPosition="left"
                positive
              >
                <Icon name="code branch" />
                {i18next.t("Create a new link")}
              </Button>
            </Grid.Column>
          </Grid>
        </Table.Cell>
      </Table.Row>
    );
  }
}

CreateAccessLink.propTypes = {
  handleCreation: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  dropdownOptions: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
};
