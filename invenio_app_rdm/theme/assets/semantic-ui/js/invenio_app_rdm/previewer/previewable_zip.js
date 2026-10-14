/*
 * SPDX-FileCopyrightText: 2025-2026 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import $ from "jquery";
import { postBreadcrumbsChange } from "./breadcrumbs/iframe";

// Breadcrumb trail of this container, from the record's file down to this archive
const containerTrail = $("[data-preview-trail]").data("preview-trail") || [];

$(document).on("click", ".preview-link", function (event) {
  event.preventDefault();
  const { itemPath, previewUrl } = this.dataset;

  // Directories inside the archive are shown in the breadcrumb, but aren't links
  const segments = itemPath.split("/").filter(Boolean);
  const itemTrail = segments.map((label, index) => ({
    label,
    url: index === segments.length - 1 ? previewUrl : null,
  }));

  if (postBreadcrumbsChange([...containerTrail, ...itemTrail])) {
    window.location.replace(previewUrl);
  } else {
    window.location.assign(previewUrl);
  }
});
