// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import PropTypes from "prop-types";

import { Label, Icon } from "semantic-ui-react";

export const RestrictedLabel = ({ visibility }) =>
  visibility === "restricted" && (
    <Label size="small" horizontal className="negative rel-ml-1">
      <Icon name="ban" />
      {i18next.t("Restricted")}
    </Label>
  );

RestrictedLabel.propTypes = {
  visibility: PropTypes.string.isRequired,
};
