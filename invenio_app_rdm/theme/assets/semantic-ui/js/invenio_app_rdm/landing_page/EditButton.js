// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import axios from "axios";
import { Icon, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export const EditButton = (props) => {
  const [loading, setLoading] = useState(false)
  const recid = props.recid;
  const handleError = props.onError;
  const handleClick = () => {
    setLoading(true);
    axios
    .post(`/api/records/${recid}/draft`)
    .then((response) => {
      window.location = `/uploads/${recid}`;
    })
    .catch((error) => {
      setLoading(false);
      handleError(error.response.data.message);
    });
  };

  return (
    <Button color="orange" size="mini" onClick={handleClick} loading={loading}>
      <Icon name="edit" />
      {i18next.t('Edit')}
    </Button>
  );
};
