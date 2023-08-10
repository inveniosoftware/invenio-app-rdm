// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import PropTypes from "prop-types";
import React from "react";
import { AccessRequestTimelineEdit } from "../AccessRequestTimelineEdit";
import { AccessRequestTimelineRead } from "../AccessRequestTimelineRead";

export const TimelineFeedHeader = ({ request, permissions }) => {
  return (
    <>
      {request.type === "guest-access-request" && (
        <>
          {request.status === "submitted" && permissions.can_manage && (
            <AccessRequestTimelineEdit request={request} />
          )}
          {request.status === "accepted" && (
            <AccessRequestTimelineRead request={request} permissions={permissions} />
          )}
        </>
      )}
    </>
  );
};

TimelineFeedHeader.propTypes = {
  request: PropTypes.object.isRequired,
  permissions: PropTypes.object.isRequired,
};
