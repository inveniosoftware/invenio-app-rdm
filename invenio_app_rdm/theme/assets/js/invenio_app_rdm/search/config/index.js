// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

export { templates } from "./templates";

const aggregations = [
  {
    title: "Access Right",
    agg: {
      field: "access_right",
      aggName: "access_right",
    },
  },
  {
    title: "Resource types",
    agg: {
      field: "resource_type",
      aggName: "resource_type",
    },
  },
];

const sortValues = [
  {
    text: "Best match",
    sortBy: "bestmatch",
    sortOrder: "desc",
    defaultOnEmptyString: true,
  },
  {
    text: "Newest",
    sortBy: "mostrecent",
    sortOrder: "asc",
    default: true,
  },
  {
    text: "Oldest",
    sortBy: "mostrecent",
    sortOrder: "desc",
  },
];

const resultsPerPageValues = [
  {
    text: "10",
    value: 10,
  },
  {
    text: "20",
    value: 20,
  },
  {
    text: "50",
    value: 50,
  },
];

const logo = "/static/images/logo.svg";

const searchApi = {
  axios: {
    baseURL: "",
    url: "/api/records",
    timeout: 5000,
  },
};

export const config = {
  logo,
  searchApi,
  aggregations,
  sortValues,
  resultsPerPageValues,
};
