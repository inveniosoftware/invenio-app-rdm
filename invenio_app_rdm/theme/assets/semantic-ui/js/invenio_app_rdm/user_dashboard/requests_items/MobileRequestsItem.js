// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import React from "react";
import RequestTypeLabel from "@js/invenio_requests/request/RequestTypeLabel";
import RequestStatusLabel from "@js/invenio_requests/request/RequestStatusLabel";
import { RequestActionController } from "@js/invenio_requests/request/actions/RequestActionController";
import { Icon, Item } from "semantic-ui-react";
import { RightBottomLabel } from "@js/invenio_communities/requests/requests_items/RightBottomLabel";
import PropTypes from "prop-types";

export const MobileRequestsItem = ({
  result,
  index,
  differenceInDays,
  isCreatorCommunity,
  creatorName,
  updateQueryState,
  currentQueryState,
}) => {
  const refreshAfterAction = () => {
    updateQueryState(currentQueryState);
  };

  return (
    <Item key={index} className="community-item mobile only flex">
      <Item.Content>
        <Item.Extra>
          {result.type && <RequestTypeLabel type={result.type} />}
          {result.status && result.is_closed && (
            <RequestStatusLabel status={result.status} />
          )}
        </Item.Extra>
        <Item.Header className="truncate-lines-2">
          <a className="header-link" href={`/me/requests/${result.id}`}>
            <Icon size="small" name="conversation" color="black" />
            {result.title}
          </a>
        </Item.Header>
        <Item.Meta>
          <small>
            {i18next.t(`Opened {{difference}} by`, {
              difference: differenceInDays,
            })}{" "}
            {isCreatorCommunity && <Icon className="default-margin" name="users" />}{" "}
            {creatorName}
          </small>
          <RightBottomLabel className="mb-5 block" result={result} />
          <div className="block">
            <RequestActionController
              request={result}
              actionSuccessCallback={refreshAfterAction}
            />
          </div>
        </Item.Meta>
      </Item.Content>
    </Item>
  );
};

MobileRequestsItem.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string,
  differenceInDays: PropTypes.string.isRequired,
  isCreatorCommunity: PropTypes.bool.isRequired,
  creatorName: PropTypes.string.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
};

MobileRequestsItem.defaultProps = {
  index: undefined,
};
