/*
 * SPDX-FileCopyrightText: 2026 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import { BREADCRUMBS_CHANGE_MESSAGE } from "./constants";

/**
 * Send the breadcrumbs of the opened item to the parent window.
 * Returns false if the page isn't embedded.
 */
export function postBreadcrumbsChange(trail) {
  if (window.parent === window) {
    return false;
  }
  window.parent.postMessage(
    { type: BREADCRUMBS_CHANGE_MESSAGE, trail },
    window.location.origin
  );
  return true;
}
