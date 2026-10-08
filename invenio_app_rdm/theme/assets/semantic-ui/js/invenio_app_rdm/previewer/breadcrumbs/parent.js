/*
 * SPDX-FileCopyrightText: 2026 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import { isSameOriginUrl } from "../../utils";
import { BREADCRUMBS_CHANGE_MESSAGE } from "./constants";

const sanitizeTrail = (trail) =>
  Array.isArray(trail)
    ? trail
        .filter((crumb) => typeof crumb?.label === "string" && crumb.label !== "")
        .map(({ label, url }) => ({
          label,
          url: typeof url === "string" && isSameOriginUrl(url) ? url : null,
        }))
    : [];

/**
 * Call `onChange(trail)` whenever the previewer in `iframeEl` posts new breadcrumbs.
 */
export function registerOnBreadcrumbsChange(iframeEl, onChange) {
  window.addEventListener("message", (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== iframeEl.contentWindow ||
      event.data?.type !== BREADCRUMBS_CHANGE_MESSAGE
    ) {
      return;
    }
    const trail = sanitizeTrail(event.data.trail);
    if (trail.length) {
      onChange(trail);
    }
  });
}

/**
 * Render `trail` as a Semantic UI breadcrumb. Crumbs with a URL are links that call
 * `onNavigate` with the trail up to the clicked crumb.
 */
export function renderBreadcrumbs(container, trail, { onNavigate, ariaLabel }) {
  const nav = document.createElement("nav");
  nav.className = "ui breadcrumb preview-breadcrumb";
  nav.setAttribute("aria-label", ariaLabel);

  if (trail.length === 1) {
    nav.textContent = trail[0].label;
    container.replaceChildren(nav);
    return;
  }

  trail.forEach((crumb, index) => {
    const isLast = index === trail.length - 1;
    if (index > 0) {
      const divider = document.createElement("span");
      divider.className = "divider";
      divider.setAttribute("aria-hidden", "true");
      divider.textContent = "/";
      nav.append(divider);
    }

    const section = document.createElement(!isLast && crumb.url ? "a" : "span");
    section.className = isLast ? "active section" : "section";
    section.textContent = crumb.label;
    section.title = crumb.label;
    if (isLast) {
      section.setAttribute("aria-current", "page");
    }
    if (section.tagName === "A") {
      section.href = crumb.url;
      section.addEventListener("click", (event) => {
        event.preventDefault();
        // Don't toggle the accordion the breadcrumb sits in
        event.stopPropagation();
        onNavigate(trail.slice(0, index + 1));
      });
    }
    nav.append(section);
  });

  container.replaceChildren(nav);
}
