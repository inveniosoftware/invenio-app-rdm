// This file is part of InvenioRDM
// Copyright (C) 2024-2024 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export const DisplayPartOfCommunities = ({ communities }) => {
  const PartOfCommunities = () => {
    const communitiesEntries = communities.entries;
    if (communitiesEntries) {
      return (
        <>
          {i18next.t("Part of ")}
          {communitiesEntries.map((community, index) => {
            if (!(community.id === communities?.default && community?.theme)) {
              return (
                <>
                  <a href={`/communities/${community.slug}`}>
                    {community.metadata?.title}
                  </a>
                  {index !== communitiesEntries.length - 1 && ", "}
                </>
              );
            }
          })}
        </>
      );
    }
  };
  return (
    <p>
      <b>{PartOfCommunities()}</b>
    </p>
  );
};

DisplayPartOfCommunities.propTypes = {
  communities: PropTypes.object.isRequired,
};
