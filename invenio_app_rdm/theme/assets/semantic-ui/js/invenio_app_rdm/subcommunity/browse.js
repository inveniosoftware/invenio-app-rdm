/*
 * SPDX-FileCopyrightText: 2024 CERN.
 * SPDX-License-Identifier: MIT
 */

import { createRoot } from "react-dom/client";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";

import { CommunitiesCardGroup } from "@js/invenio_communities/community";

const subCommunitiesContainer = document.getElementById("subcommunities-container");
const apiEndpoint = _get(subCommunitiesContainer.dataset, "apiEndpoint");

if (subCommunitiesContainer) {
  createRoot(subCommunitiesContainer).render(
    <CommunitiesCardGroup
      fetchDataUrl={`${apiEndpoint}?sort=oldest&page=1&size=5`}
      emptyMessage={i18next.t("This community has no subcommunities")}
      defaultLogo="/static/images/square-placeholder.png"
    />
  );
}
