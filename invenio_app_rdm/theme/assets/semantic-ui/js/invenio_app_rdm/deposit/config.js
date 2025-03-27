// This file is part of InvenioRDM
// Copyright (C) 2025 CERN.
//
// Invenio APP RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import { i18next } from "@translations/invenio_app_rdm/i18next";

const depositFormSectionsConfig = {
  "files-section": ["files.enabled"],
  "basic-information-section": [
    "pids.doi",
    "metadata.resource_type",
    "metadata.title",
    "metadata.additional_titles",
    "metadata.publication_date",
    "metadata.creators",
    "metadata.description",
    "metadata.additional_descriptions",
    "metadata.rights",
  ],
  "recommended-information-section": [
    "metadata.contributors",
    "metadata.subjects",
    "metadata.languages",
    "metadata.dates",
    "metadata.version",
    "metadata.publisher",
  ],
  "funding-section": ["metadata.funding"],
  "alternate-identifiers-section": ["metadata.identifiers"],
  "related-works-section": ["metadata.related_identifiers"],
  "visibility-section": ["access.files", "access.embargo.until"],
};

const severityChecksConfig = {
  info: {
    label: i18next.t("Recommendation"),
    description: i18next.t("This check is recommended but not mandatory."),
  },
  error: {
    label: i18next.t("Error"),
    description: i18next.t(
      "This check indicates a critical issue that must be addressed."
    ),
  },
};

export { depositFormSectionsConfig, severityChecksConfig };
