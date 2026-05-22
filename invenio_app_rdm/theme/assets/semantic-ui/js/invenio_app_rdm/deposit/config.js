/*
 * SPDX-FileCopyrightText: 2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import { i18next } from "@translations/invenio_app_rdm/i18next";

const depositFormSectionsConfig = {
  "files-section": ["files.enabled", "files.entries"],
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
    label: i18next.t("Recommendation(s)"),
    description: i18next.t("This check is recommended but not mandatory."),
  },
  error: {
    label: i18next.t("Error(s)"),
    description: i18next.t(
      "This check indicates a critical issue that must be addressed."
    ),
  },
};

export { depositFormSectionsConfig, severityChecksConfig };
