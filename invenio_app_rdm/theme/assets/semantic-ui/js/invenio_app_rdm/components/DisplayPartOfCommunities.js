// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Popup, Icon } from "semantic-ui-react";

export const DisplayPartOfCommunities = ({ communities }) => {
  const PartOfCommunities = () => {
    // FIXME: Uncomment to enable themed banner
    // const communitiesEntries = communities.entries?.filter((community) => !(community.id === communities?.default && community?.theme));
    let communitiesEntries = communities.entries;

    if (communitiesEntries?.length > 0) {
      communitiesEntries = communitiesEntries.sort((a, b) => {
        // Put parent communities before other communities.
        if (
          a.children !== undefined &&
          b.children !== undefined &&
          a.children.allow !== b.children.allow
        ) {
          return a.children.allow ? -1 : 1;
        }
        // Put subcommunities before regular communities.
        if ((a.parent !== undefined) !== (b.parent !== undefined)) {
          return a.parent !== undefined ? -1 : 1;
        }
        // Then sort communities by their title.
        const titleCompare = a.metadata?.title.localeCompare(b.metadata?.title);
        if (titleCompare !== undefined && titleCompare !== 0) {
          return titleCompare;
        }
        // Finally if all else is equal, sort by slug (which is unique).
        return a.slug.localeCompare(b.slug);
      });

      return (
        <>
          {i18next.t("Part of ")}
          {communitiesEntries.map((community, index) => {
            return (
              <Fragment key={community.slug}>
                <a href={`/communities/${community.slug}`}>
                  {community.metadata?.title}
                </a>
                <span>&nbsp;</span>
                {/* Show the icon for communities allowing children, and for subcommunities */}
                {(community.children?.allow || community.parent !== undefined) && (
                  <Popup
                    trigger={<Icon name="check outline circle" color="green mr-0" />}
                    content="Verified community"
                    position="top center"
                  />
                )}

                {index !== communitiesEntries.length - 1 && ", "}
              </Fragment>
            );
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
