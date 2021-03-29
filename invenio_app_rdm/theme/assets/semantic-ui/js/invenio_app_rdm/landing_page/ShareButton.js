// This file is part of InvenioRDM
// Copyright (C) 2021 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Icon, Button, Popup } from "semantic-ui-react";

export const ShareButton = (props) => {
  return (
    <Popup
      content="You don't have permissions to share this record."
      disabled={!props.disabled}
      trigger={
        <div>
          <Button disabled={props.disabled} primary size="mini">
            <Icon name="share square" />
            Share
          </Button>
        </div>
      }
    />
  );
};
