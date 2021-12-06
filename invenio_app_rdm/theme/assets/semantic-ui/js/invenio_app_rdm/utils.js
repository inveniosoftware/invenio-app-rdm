// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 New York University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import axios from "axios";
import _get from "lodash/get";
import React from "react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
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


export function SearchItemCreators({creators}) {

  function getIcon(creator) {
    let ids = _get(creator, "person_or_org.identifiers", []);
    let creatorName = _get(creator, "person_or_org.name", "No name");
    let firstId = ids.filter((id) => ["orcid", "ror"].includes(id.scheme))[0];
    firstId = firstId || {scheme: ""};
    let icon = null;
    switch (firstId.scheme) {
      case "orcid":
        icon = <a href={"https://orcid.org/" + `${ firstId.identifier}`} aria-label={`${creatorName}: ${i18next.t("ORCID profile")}`} title={`${creatorName}: ${i18next.t("ORCID profile")}`}><img className="inline-id-icon" src="/static/images/orcid.svg" alt="" /></a>;
        break;
      case "ror":
        icon = <a href={"https://ror.org/" + `${ firstId.identifier}`} aria-label={`${creatorName}: ${i18next.t("ROR profile")}`} title={`${creatorName}: ${i18next.t("ROR profile")}`}><img className="inline-id-icon" src="/static/images/ror-icon.svg" alt="" /></a>;
        break;
      default:
        break;
    }
    return icon;
  }

  function getLink(creator) {
    let creatorName = _get(creator, "person_or_org.name", "No name");
    let link = <a href={`/search?q=metadata.creators.person_or_org.name:"${ creatorName }"`} title={ `${creatorName}: ${(i18next.t("Search"))}`}>{creatorName}</a>;
    return link;
  }
  return creators.map((creator, index) => (
    <span key={index}>
      {getIcon(creator)}
      {getLink(creator)}
      {index < creators.length - 1 && ";"}
    </span>
  ));

}
