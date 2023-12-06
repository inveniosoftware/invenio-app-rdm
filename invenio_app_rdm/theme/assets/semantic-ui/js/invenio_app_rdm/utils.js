// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 New York University.
// Copyright (C) 2022 data-futures.
// Copyright (C) 2023 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _get from "lodash/get";
import React from "react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { DateTime } from "luxon";

export function SearchItemCreators({ creators, className, othersLink }) {
  let spanClass = "creatibutor-wrap separated";
  className && (spanClass += ` ${className}`);

  function makeIcon(scheme, identifier, name) {
    let link = null;
    let linkTitle = null;
    let icon = null;
    let alt = "";

    switch (scheme) {
      case "orcid":
        link = `https://orcid.org/${identifier}`;
        linkTitle = i18next.t("ORCID profile");
        icon = "/static/images/orcid.svg";
        alt = "ORCID logo";
        break;
      case "ror":
        link = `https://ror.org/${identifier}`;
        linkTitle = i18next.t("ROR profile");
        icon = "/static/images/ror-icon.svg";
        alt = "ROR logo";
        break;
      case "gnd":
        link = `https://d-nb.info/gnd/${identifier}`;
        linkTitle = i18next.t("GND profile");
        icon = "/static/images/gnd-icon.svg";
        alt = "GND logo";
        break;
      default:
        return null;
    }

    icon = (
      <a
        className="no-text-decoration mr-0"
        href={link}
        aria-label={`${name}: ${linkTitle}`}
        title={`${name}: ${linkTitle}`}
        key={scheme}
      >
        <img className="inline-id-icon ml-5" src={icon} alt={alt} />
      </a>
    );
    return icon;
  }

  function getIcons(creator) {
    let ids = _get(creator, "person_or_org.identifiers", []);
    let creatorName = _get(creator, "person_or_org.name", "No name");
    let icons = ids.map((c) => makeIcon(c.scheme, c.identifier, creatorName));
    return icons;
  }

  function getLink(creator) {
    let creatorName = _get(creator, "person_or_org.name", "No name");
    let link = (
      <a
        className="creatibutor-link"
        href={`/search?q=metadata.creators.person_or_org.name:"${creatorName}"`}
        title={`${creatorName}: ${i18next.t("Search")}`}
      >
        <span className="creatibutor-name">{creatorName}</span>
      </a>
    );
    return link;
  }

  const numDisplayed = 3;
  const result = creators.slice(0, numDisplayed).map((creator) => (
    <span className={spanClass} key={creator.person_or_org.name}>
      {getLink(creator)}
      {getIcons(creator)}
    </span>
  ));

  const numExtra = creators.length - numDisplayed;
  if (0 < numExtra) {
    let text;
    if (numExtra === 1) {
      text = "and {{count}} other";
    } else {
      text = "and {{count}} others";
    }
    result.push(
      <span className={spanClass} key={text}>
        <a className="creatibutor-link" href={othersLink}>
          <span className="creatibutor-name">
            {i18next.t(text, { count: numExtra })}
          </span>
        </a>
      </span>
    );
  }

  return result;
}

/**
 * Returns a human readable timestamp in the format "4 days ago".
 *
 * @param {Date} timestamp
 * @returns string
 */
export const timestampToRelativeTime = (timestamp) =>
  DateTime.fromISO(timestamp).setLocale(i18next.language).toRelative();
