// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
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
import { Image } from "react-invenio-forms";

class UserAccessSearchResultItem extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, success: undefined };
  }
  handleDelete = async () => {
    const { record, result, setError } = this.props;
    this.setState({ loading: true });
    const cancellableAction = withCancel(
      http.delete(`${record.links.access_users}/${result.id}`)
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
    const { result, permissions } = this.props;
    const { loading, success } = this.state;
    const user = result.expanded.subject;

    return (
      <Table.Row>
        <Table.Cell>
          <Grid textAlign="left" verticalAlign="middle">
            <Grid.Column>
              <Item
                className={user.is_current_user ? "flex align-no-checkbox" : "flex"}
                key={result.id}
              >
                <Image
                  src={user.links.avatar}
                  avatar
                  className={user.is_current_user ? "" : "rel-ml-1"}
                  alt=""
                />
                <Item.Content className="ml-10">
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

        <Table.Cell data-label={i18next.t("Access")}>{result.permission}</Table.Cell>

        <Table.Cell data-label={i18next.t("Actions")} textAlign="right">
          <div>
            {permissions.can_manage && (
              <>
                {success && <SuccessIcon timeOutDelay={3000} show={success} />}
                <Button
                  size="small"
                  labelPosition="left"
                  icon="user delete"
                  className="fluid-computer-only"
                  compact
                  negative
                  disabled={loading}
                  loading={loading}
                  content={i18next.t("Remove access")}
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
    const { results, fetchData, record, permissions, setError } = this.props;
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell data-label="User" width={4}>
              {i18next.t("People with access")}
            </Table.HeaderCell>
            <Table.HeaderCell data-label="Access" width={3}>
              {i18next.t("Access")}
            </Table.HeaderCell>
            <Table.HeaderCell width={4} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
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
    );
  }
}

UserAccessSearchResult.propTypes = {
  record: PropTypes.object.isRequired,
  results: PropTypes.array.isRequired,
  permissions: PropTypes.object.isRequired,
  fetchData: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};
