// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 New York University.
// Copyright (C) 2022 data-futures.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _get from "lodash/get";
import React from "react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { DateTime } from "luxon";
/**
 * Wrap a promise to be cancellable and avoid potential memory leaks
 * https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 * @param promise the promise to wrap
 * @returns {Object} an object containing the promise to resolve and a `cancel` fn to reject the promise
 */
export const withCancel = (promise) => {
  let isCancelled = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (isCancelled ? reject("UNMOUNTED") : resolve(val)),
      (error) => (isCancelled ? reject("UNMOUNTED") : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      isCancelled = true;
    },
  };
};

const apiConfig = {
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
};

export const axiosWithconfig = axios.create(apiConfig);

export function SearchItemCreators({ creators }) {
  function makeIcon(scheme, identifier, name) {
    let link = null;
    let linkTitle = null;
    let icon = null;

    switch (scheme) {
      case "orcid":
        link = "https://orcid.org/" + identifier;
        linkTitle = i18next.t("ORCID profile");
        icon = "/static/images/orcid.svg";
        break;
      case "ror":
        link = "https://ror.org/"+identifier;
        linkTitle = i18next.t("ROR profile");
        icon = "/static/images/ror-icon.svg";
        break;
      case "gnd":
        link = "https://d-nb.info/gnd/"+identifier;
        linkTitle = i18next.t("GND profile");
        icon = "/static/images/gnd-icon.svg";
        break;
      default:
        return null;
    }

    icon = (
      <a
         className="no-text-decoration"
         href={ link }
         aria-label={`${name}: ${linkTitle}`}
         title={`${name}: ${linkTitle}`}
         key={scheme}
      >
        <img
          className="inline-id-icon ml-5"
          src= { icon }
          alt=""
        />
      </a>
    )
    return (icon);
  }

  function getIcons(creator) {
    let ids = _get(creator, "person_or_org.identifiers", []);
    let creatorName = _get(creator, "person_or_org.name", "No name");
    let icons = ids.map(c => makeIcon(c.scheme, c.identifier, creatorName));
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
  return creators.map((creator, index) => (
    <span className="creatibutor-wrap" key={index}>
      {getLink(creator)}
      {getIcons(creator)}
      {index < creators.length - 1 && ";"}
    </span>
  ));
}

/**
 * Returns a human readable timestamp in the format "4 days ago".
 *
 * @param {Date} timestamp
 * @returns string
 */
export const timestampToRelativeTime = (timestamp) =>
  DateTime.fromISO(timestamp).setLocale(i18next.language).toRelative();
