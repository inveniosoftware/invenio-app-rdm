// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import { Label, Image } from "semantic-ui-react";

export const DisplayVerifiedCommunity = ({ communities }) => {
  const filterBrandedCommunity = (parentCommunities) => {
    const brandedCommunityId = parentCommunities?.default;
    const communities = parentCommunities?.entries;
    let displayCommunity = null;

    if (communities) {
      communities.map((community) => {
        if (community.id === brandedCommunityId && community?.theme) {
          displayCommunity = community;
        }
        return displayCommunity;
      });
    }

    return displayCommunity;
  };

  const verifiedCommunity = filterBrandedCommunity(communities);

  if (!verifiedCommunity) {
    return null;
  }

  return (
    <Label
      as="a"
      href={`/communities/${verifiedCommunity.slug}`}
      style={{ backgroundColor: verifiedCommunity?.theme?.style?.primaryColor }}
      className="themed-community-label"
    >
      {verifiedCommunity.metadata.title}
      <Image
        className="themed-community-logo right-floated"
        src={`/api/communities/${verifiedCommunity.slug}/logo`}
        alt=""
      />
    </Label>
  );
};

DisplayVerifiedCommunity.propTypes = {
  communities: PropTypes.object.isRequired,
};
