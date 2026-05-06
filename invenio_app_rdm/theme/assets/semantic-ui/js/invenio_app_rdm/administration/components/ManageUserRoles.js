/*
 * This file is part of Invenio-App-Rdm
 * Copyright (C) 2023-2024 CERN.
 * Copyright (C) 2026 KTH Royal Institute of Technology.
 *
 * Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Dropdown } from "semantic-ui-react";
import { ResourceActions } from "@js/invenio_administration";
import { OverridableContext } from "react-overridable";
import { ManageUserRolesForm } from "./ManageUserRolesForm";

const ManageRolesDropdownItem = (props) => <Dropdown.Item {...props} />;

const ManageRolesButton = (props) => (
  <Button primary size="small" {...props} basic={false} />
);

export class ManageUserRoles extends Component {
  render() {
    const { actions, asDropdownItem, successCallback, user } = this.props;
    const manageRolesAction = actions?.manage_roles;
    if (!manageRolesAction || !user.links?.manage_roles) {
      return null;
    }

    return (
      <OverridableContext.Provider
        value={{
          "InvenioAdministration.ResourceActions.ModalBody.manage_roles":
            ManageUserRolesForm,
        }}
      >
        <ResourceActions
          actions={{ manage_roles: manageRolesAction }}
          Element={asDropdownItem ? ManageRolesDropdownItem : ManageRolesButton}
          resource={user}
          successCallback={successCallback}
        />
      </OverridableContext.Provider>
    );
  }
}

ManageUserRoles.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  asDropdownItem: PropTypes.bool,
};

ManageUserRoles.defaultProps = {
  asDropdownItem: true,
};
