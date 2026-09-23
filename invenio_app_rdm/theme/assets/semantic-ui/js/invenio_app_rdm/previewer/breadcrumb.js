/*
 * SPDX-FileCopyrightText: 2026 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

// Breadcrumb for previews of files inside containers (e.g. ZIP archives).
//
// A container previewer runs inside the landing page's preview iframe. When the
// user opens one of its items, it posts the full breadcrumb trail to the parent
// window, which only renders it. A trail is a list of `{ label, url }` crumbs from
// the root file down to the previewed item; `url` is optional (e.g. directories).
// Every container page appends its item to its own trail, so any nesting depth
// works without the landing page knowing anything about the container type.

const MESSAGE_TYPE = "invenio-previewer:breadcrumb";

const isSameOriginUrl = (url) => {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

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
 * Iframe side: announce the trail of the preview that is about to be shown.
 *
 * Returns false when the page is not embedded in a same-origin parent.
 */
export function postPreviewBreadcrumb(trail) {
  if (window.parent === window) {
    return false;
  }
  window.parent.postMessage({ type: MESSAGE_TYPE, trail }, window.location.origin);
  return true;
}

/**
 * Parent side: call `callback(trail)` for breadcrumbs posted by `iframe`.
 *
 * Only messages coming from this particular iframe's window are accepted.
 * Returns a function that removes the listener.
 */
export function onPreviewBreadcrumb(iframe, callback) {
  const handler = (event) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== iframe.contentWindow ||
      event.data?.type !== MESSAGE_TYPE
    ) {
      return;
    }
    const trail = sanitizeTrail(event.data.trail);
    if (trail.length) {
      callback(trail);
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}

/**
 * Render `trail` into `container` as a Semantic UI breadcrumb.
 *
 * Crumbs with a URL (except the last one) become links; clicking one calls
 * `onNavigate(trail.slice(0, index + 1))`. A single crumb is rendered as plain text.
 */
export function renderPreviewBreadcrumb(container, trail, { onNavigate, ariaLabel }) {
  if (trail.length === 1) {
    container.textContent = trail[0].label;
    return;
  }

  const nav = document.createElement("nav");
  nav.className = "ui breadcrumb preview-breadcrumb";
  if (ariaLabel) {
    nav.setAttribute("aria-label", ariaLabel);
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
        // The breadcrumb lives inside the accordion trigger; don't toggle the panel.
        event.stopPropagation();
        onNavigate(trail.slice(0, index + 1));
      });
    }
    nav.append(section);
  });

  container.replaceChildren(nav);
}
