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
import { Image, dropdownOptionsGenerator } from "react-invenio-forms";
import { AccessDropdown } from "../AccessLinks/AccessDropdown";
import { dropdownOptions } from "../AccessLinks/LinksSearchResultContainer";
import { AddUserAccessModal } from "./AddUserAccessModal";

const accessDropdownOptions = [
  ...dropdownOptions,
  {
    key: "manage",
    name: "manage",
    text: i18next.t("Can manage"),
    title: i18next.t("Can manage"),
    value: "manage",
    description: i18next.t(
      "Can manage access, edit drafts and view restricted records/files."
    ),
  },
];

class UserAccessSearchResultItem extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, success: undefined };
  }
  handleDelete = async () => {
    const { record, result, setError } = this.props;
    this.setState({ loading: true });
    const cancellableAction = withCancel(
      http.delete(`${record.links.access_users}/${result?.expanded?.subject?.id}`)
    );
    try {
      await cancellableAction.promise;
      this.setState({ loading: false, success: true });
      this.handleSuccess(result.id);
    } catch (error) {
      this.setState({ loading: false });
      console.error(error);
      setError(error);
    }
  };
  handleSuccess = (data) => {
    const { deleteSuccessCallback } = this.props;
    deleteSuccessCallback(data);
  };

  render() {
    const { result, permissions, record } = this.props;
    const { loading, success } = this.state;
    const user = result.expanded.subject;
    return (
      <Table.Row>
        <Table.Cell width={8}>
          <Grid textAlign="left" verticalAlign="middle">
            <Grid.Column>
              <Item className="flex" key={result.id}>
                <Image src={user.links.avatar} avatar className="rel-ml-1" alt="" />
                <Item.Content className="ml-10 p-0">
                  <Item.Header
                    className={`flex align-items-center ${
                      !user.description ? "mt-5" : ""
                    }`}
                  >
                    <b className="mr-10">{user.profile.full_name || user.username}</b>

                    {user.is_current_user && (
                      <Label size="tiny" className="primary">
                        {i18next.t("You")}
                      </Label>
                    )}
                  </Item.Header>
                  {user.profile.affiliations && (
                    <Item.Meta>{user.profile.affiliations}</Item.Meta>
                  )}
                </Item.Content>
              </Item>
            </Grid.Column>
          </Grid>
        </Table.Cell>

        <Table.Cell data-label={i18next.t("Access")} width={4}>
          <AccessDropdown
            updateEndpoint={`${record.links.access_users}/${result?.expanded?.subject?.id}`}
            dropdownOptions={dropdownOptionsGenerator(accessDropdownOptions)}
            result={result}
          />
        </Table.Cell>

        <Table.Cell data-label={i18next.t("Actions")} textAlign="center" width={3}>
          <div>
            {permissions.can_manage && (
              <>
                {success && <SuccessIcon timeOutDelay={3000} show={success} />}
                <Button
                  size="medium"
                  labelPosition="left"
                  icon="trash alternate outline"
                  className="fluid-computer-only"
                  compact
                  disabled={loading}
                  loading={loading}
                  content={i18next.t("Remove")}
                  onClick={this.handleDelete}
                />
              </>
            )}
          </div>
        </Table.Cell>
      </Table.Row>
    );
  }
}

UserAccessSearchResultItem.propTypes = {
  record: PropTypes.object.isRequired,
  result: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
  deleteSuccessCallback: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export class UserAccessSearchResult extends Component {
  render() {
    const { results, fetchData, record, permissions, setError, recOwner } = this.props;
    return (
      <>
        <AddUserAccessModal
          isComputer={false}
          accessDropdownOptions={accessDropdownOptions}
          results={results}
          record={record}
          fetchData={fetchData}
        />
        <Table className="fixed-header">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell data-label="User" width={8}>
                {i18next.t("People with access")}
              </Table.HeaderCell>
              <Table.HeaderCell data-label="Access" width={4}>
                {i18next.t("Access")}
              </Table.HeaderCell>
              <Table.HeaderCell textAlign="center" width={3}>
                <AddUserAccessModal
                  isComputer
                  accessDropdownOptions={accessDropdownOptions}
                  results={results}
                  record={record}
                  fetchData={fetchData}
                />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={8}>
                <Grid textAlign="left" verticalAlign="middle">
                  <Grid.Column>
                    <Item className="flex">
                      <Image
                        src={recOwner.links.avatar}
                        avatar
                        className="rel-ml-1"
                        alt=""
                      />
                      <Item.Content className="ml-10 p-0">
                        <Item.Header
                          className={`flex align-items-center ${
                            !recOwner.description ? "mt-5" : ""
                          }`}
                        >
                          <b className="mr-10">
                            {recOwner.profile.full_name || recOwner.username}
                          </b>
                          {recOwner.is_current_user && (
                            <Label size="tiny" className="primary">
                              {i18next.t("You")}
                            </Label>
                          )}
                        </Item.Header>
                        {recOwner.profile.affiliations && (
                          <Item.Meta>{recOwner.profile.affiliations}</Item.Meta>
                        )}
                      </Item.Content>
                    </Item>
                  </Grid.Column>
                </Grid>
              </Table.Cell>
              <Table.Cell textAlign="left" data-label={i18next.t("Access")} width={4}>
                {i18next.t("Owner")}
              </Table.Cell>
              <Table.Cell width={3} />
            </Table.Row>
            {results.map((result) => (
              <UserAccessSearchResultItem
                key={result.id}
                result={result}
                record={record}
                permissions={permissions}
                deleteSuccessCallback={fetchData}
                setError={setError}
              />
            ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}

UserAccessSearchResult.propTypes = {
  record: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  permissions: PropTypes.object.isRequired,
  fetchData: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  recOwner: PropTypes.object.isRequired,
};
