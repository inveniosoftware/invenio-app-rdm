// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Dropdown } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

export const ManageButton = ({ recid, recordOwnerUsername }) => {
  return (
    <Dropdown
      fluid
      text={i18next.t("Manage")}
      icon="cog"
      floating
      labeled
      button
      className="icon text-align-center"
    >
      <Dropdown.Menu>
        <Dropdown.Item
          as="a"
          href={`/administration/records?q=id:${recid}`}
          target="_blank"
          key="manage_record"
          text={i18next.t("Manage record")}
        />
        <Dropdown.Item
          as="a"
          href={`/administration/users?q=username:${recordOwnerUsername}`}
          target="_blank"
          key="manage_user"
          text={i18next.t("Manage user")}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
};

ManageButton.propTypes = {
  recid: PropTypes.string.isRequired,
  recordOwnerUsername: PropTypes.string.isRequired,
};
