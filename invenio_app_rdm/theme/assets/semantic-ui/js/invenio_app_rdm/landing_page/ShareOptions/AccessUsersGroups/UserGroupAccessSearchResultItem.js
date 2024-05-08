// This file is part of InvenioRDM
// Copyright (C) 2021-2024 CERN.
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import React, { Component } from "react";
import { Table, Button, Item, Label, Grid } from "semantic-ui-react";
import { withCancel, http } from "react-invenio-forms";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";
import { SuccessIcon } from "@js/invenio_communities/members";
import { Image, dropdownOptionsGenerator, ErrorMessage } from "react-invenio-forms";
import { AccessDropdown } from "../AccessLinks/AccessDropdown";
import { dropdownOptions } from "../AccessLinks/LinksSearchResultContainer";

export const accessDropdownOptions = [
  ...dropdownOptions,
  {
    key: "manage",
    name: "manage",
    text: i18next.t("Can manage"),
    title: i18next.t("Can manage"),
    value: "manage",
    description: i18next.t(
      "Can manage access, edit drafts and view restricted files of all versions of this record."
    ),
  },
];

export class UserGroupAccessSearchResultItem extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, success: undefined, error: undefined };
  }
  handleDelete = async () => {
    const { result, endpoint } = this.props;
    this.setState({ loading: true });
    const cancellableAction = withCancel(
      http.delete(`${endpoint}/${result?.expanded?.subject?.id}`)
    );
    try {
      await cancellableAction.promise;
      this.setState({ loading: false, success: true });
      this.handleSuccess();
    } catch (error) {
      this.setState({ loading: false, error: error });
      console.error(error);
    }
  };
  handleSuccess = () => {
    const { onGrantAddedOrDeleted, endpoint, searchType } = this.props;
    onGrantAddedOrDeleted(`${endpoint}?expand=true`, searchType);
  };

  render() {
    const { result, permissions, endpoint, searchType, onPermissionChanged } =
      this.props;
    const { loading, success, error } = this.state;
    const entity = result.expanded.subject;
    return (
      <Table.Row>
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
            <Table.Cell width={8}>
              <Grid textAlign="left" verticalAlign="middle">
                <Grid.Column>
                  <Item className="flex" key={result.id}>
                    <Image
                      src={entity.links.avatar}
                      avatar
                      className="rel-ml-1"
                      alt=""
                    />
                    <Item.Content className="ml-10 p-0">
                      <Item.Header
                        className={`flex align-items-center ${
                          !entity.description ? "mt-5" : ""
                        }`}
                      >
                        <b className="mr-10">
                          {entity.profile?.full_name ||
                            entity?.username ||
                            entity?.name}
                        </b>

                        {entity.is_current_user && (
                          <Label size="tiny" className="primary">
                            {i18next.t("You")}
                          </Label>
                        )}
                      </Item.Header>
                      {entity.profile?.affiliations && (
                        <Item.Meta>{entity.profile?.affiliations}</Item.Meta>
                      )}
                    </Item.Content>
                  </Item>
                </Grid.Column>
              </Grid>
            </Table.Cell>

            <Table.Cell data-label={i18next.t("Access")} width={4}>
              <AccessDropdown
                updateEndpoint={`${endpoint}/${result?.expanded?.subject?.id}`}
                dropdownOptions={dropdownOptionsGenerator(accessDropdownOptions)}
                result={result}
                onPermissionChanged={onPermissionChanged}
                entityType={searchType}
              />
            </Table.Cell>

            <Table.Cell data-label={i18next.t("Actions")} textAlign="center" width={3}>
              <div>
                {permissions.can_manage && (
                  <>
                    {success && <SuccessIcon timeOutDelay={3000} show={success} />}
                    <Button
                      size="small"
                      labelPosition="left"
                      icon="trash"
                      className="fluid-computer-only"
                      compact
                      negative
                      disabled={loading}
                      loading={loading}
                      content={i18next.t("Delete")}
                      onClick={this.handleDelete}
                    />
                  </>
                )}
              </div>
            </Table.Cell>
          </>
        )}
      </Table.Row>
    );
  }
}

UserGroupAccessSearchResultItem.propTypes = {
  result: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  onGrantAddedOrDeleted: PropTypes.func.isRequired,
  onPermissionChanged: PropTypes.func.isRequired,
  endpoint: PropTypes.string.isRequired,
  searchType: PropTypes.oneOf(["group", "role", "user"]).isRequired,
};
