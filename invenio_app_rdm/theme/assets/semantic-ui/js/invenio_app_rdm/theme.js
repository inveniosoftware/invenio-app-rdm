/*
 * SPDX-FileCopyrightText: 2024-2026 CERN.
 * SPDX-FileCopyrightText: 2024 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

import $ from "jquery";
import { MultipleOptionsSearchBar } from "@js/invenio_search_ui/components";
import { CopyButton } from "@js/invenio_app_rdm/components/CopyButton";
import { ManageButton } from "@js/invenio_app_rdm/landing_page/ManageButton";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { createRoot } from "react-dom/client";
import React from "react";

const renderReact = (component, element) => createRoot(element).render(component);

/* Expand and collapse navbar  */
const toggleIcon = $("#rdm-burger-menu-icon");
const menu = $("#invenio-nav");

toggleIcon.on("click", function () {
  menu.toggleClass("active");
});

$(".jump-to-top").on("click", function () {
  document.documentElement.scrollTop = 0;
});

const tabElementSelector = ".rdm-tab-menu .item";
const $tabElement = $(tabElementSelector);

$tabElement.tab({
  onVisible: function (tab) {
    $(tabElementSelector).attr("aria-selected", false);
    $(`#${tab}-tab`).attr("aria-selected", true);

    $(".rdm-tab-container .tab.segment").attr("hidden", true);
    $(`#${tab}-tab-panel`).attr("hidden", false);
  },
});

// Update URL hash on tab click: #outerTab or #outerTab/innerTab for nested tabs.
function updateTabHash($tab) {
  const tab = $tab.data("tab");
  if (!tab) return;
  const outerPanel = $tab.closest(".rdm-tab-container .tab.segment");
  const hash = outerPanel.length ? `${outerPanel.data("tab")}/${tab}` : tab;
  window.history.replaceState(null, "", `#${hash}`);
}

$tabElement.on("click", function () {
  updateTabHash($(this));
});

// Preserve current tab hash across any form submit that opts in via a
// `return_hash` hidden input, so redirect can restore the active tab afterwards
$(".rdm-tab-container").on("submit", "form", function (event) {
  const input = this.querySelector('input[name="return_hash"]');
  if (input) {
    input.value = window.location.hash.slice(1);
  }
});

// Restore active tab from URL hash on page load (#outerTab or #outerTab/innerTab).
const hash = window.location.hash.slice(1);
if (hash) {
  const [outerTab, innerTab] = hash.split("/");
  const $outerItem = $(
    `.rdm-tab-container > .rdm-tab-menu .item[data-tab="${outerTab}"]`
  );
  $outerItem.tab("change tab", outerTab);
  // belt-and-suspenders: Semantic UI's tab() doesn't always clear a literal `hidden` attribute
  $(`.rdm-tab-container .tab.segment[data-tab="${outerTab}"]`).removeAttr("hidden");

  if (innerTab) {
    $(`${tabElementSelector}[data-tab="${innerTab}"]`).tab("change tab", innerTab);
  }
}

// adding missing accessibility event (change tabs on enter keystroke)
$tabElement.on("keydown", function (event) {
  if (event.key === "Enter") {
    let dataTab = event.target.attributes["data-tab"];
    let tabName = dataTab && dataTab.value;
    $(event.target).tab("change tab", tabName);
    updateTabHash($(event.target));
  }
});

/* User profile dropdown */
$("#user-profile-dropdown.ui.dropdown").dropdown({
  showOnFocus: false,
  selectOnKeydown: false,
  action: (text, value, element) => {
    // needed to trigger navigation on keyboard interaction
    let path = element.attr("href");
    window.location.pathname = path;
  },
  onShow: () => {
    $("#user-profile-dropdown-btn").attr("aria-expanded", true);
  },
  onHide: () => {
    $("#user-profile-dropdown-btn").attr("aria-expanded", false);
  },
});

/* Quick create ("plus") dropdown */
$("#quick-create-dropdown.ui.dropdown").dropdown({
  showOnFocus: false,
  selectOnKeydown: false,
  action: (text, value, element) => {
    // needed to trigger navigation on keyboard interaction
    let path = element.attr("href");
    window.location.pathname = path;
  },
  onShow: () => {
    $("#quick-create-dropdown-btn").attr("aria-expanded", true);
  },
  onHide: () => {
    $("#quick-create-dropdown-btn").attr("aria-expanded", false);
  },
});

/* Burger menu */
const $burgerIcon = $("#rdm-burger-menu-icon");
const $closeBurgerIcon = $("#rdm-close-burger-menu-icon");

const handleBurgerClick = () => {
  $burgerIcon.attr("aria-expanded", true);
  $("#invenio-nav").addClass("active");
  $closeBurgerIcon.trigger("focus");
  $burgerIcon.css("display", "none");
};

const handleBurgerCloseClick = () => {
  $burgerIcon.css("display", "block");
  $burgerIcon.attr("aria-expanded", false);
  $("#invenio-nav").removeClass("active");
  $burgerIcon.trigger("focus");
};

$burgerIcon.on({ click: handleBurgerClick });
$closeBurgerIcon.on({ click: handleBurgerCloseClick });

const $invenioMenu = $("#invenio-menu");

$invenioMenu.on("keydown", (event) => {
  if (event.key === "Escape") {
    handleBurgerCloseClick();
  }
});

// Search bar
const headerSearchbar = document.getElementById("header-search-bar");

if (headerSearchbar) {
  const searchBarOptions = JSON.parse(headerSearchbar.dataset.options);

  renderReact(
    <MultipleOptionsSearchBar
      options={searchBarOptions}
      placeholder={i18next.t("Search records...")}
    />,
    headerSearchbar
  );
}

// Login Logout Button
const $authButton = $("#invenio-nav.ui.menu").find(".auth-button");
const $authIcon = $authButton.find(".auth-icon");

const handleAuthButtonClick = () => {
  $authButton.attr(
    "aria-label",
    $authIcon.hasClass("sign-in")
      ? i18next.t("Logging in...")
      : i18next.t("Logging out...")
  );
  $authButton.attr("aria-busy", "true");
  $authButton.addClass("disabled");
  $authIcon.attr("class", "spinner loading icon");
};

$authButton.on({ click: handleAuthButtonClick });

const invenioConfig = JSON.parse(document.body.dataset.invenioConfig);
const isMathJaxEnabled = invenioConfig?.isMathJaxEnabled;
if (window.invenio) {
  window.invenio.onSearchResultsRendered = async (elements) => {
    if (isMathJaxEnabled) {
      // Re-render mathematical content on the page using MathJax.
      // The promise is required to make sure that MathJax is fully loaded before
      // typesetting, and potentially autoloading extra extensions.
      // Only render the list of elements that are provided, otherwise render all elements (when undefined).
      await window.MathJax.typesetPromise(elements);
    }
  };
}

// Copy Buttons for DOI
document.querySelectorAll(".copy-doi-button").forEach((element) => {
  renderReact(
    <CopyButton text={element.dataset.value} size={element.dataset.size} />,
    element
  );
});

$("#record-tab").on("click", function () {
  // Since we use hidden for record-tab-panel in the request details template, the previewer has
  // zero width and zero height and it's failing initialization. So we need to reload the iframe.
  const iframe = document.getElementById("preview-iframe");
  if (iframe) {
    iframe.contentWindow.location.reload();
  }
});

// Tombstone Manage Button
const tombstoneManageButtonDiv = document.getElementById("tombstone-manage-button");
if (tombstoneManageButtonDiv) {
  renderReact(
    <ManageButton
      record={JSON.parse(tombstoneManageButtonDiv.dataset.record)}
      permissions={JSON.parse(tombstoneManageButtonDiv.dataset.permissions)}
      uiProps={JSON.parse(tombstoneManageButtonDiv.dataset.uiProps)}
      auditLogsEnabled={JSON.parse(tombstoneManageButtonDiv.dataset.auditLogsEnabled)}
    />,
    tombstoneManageButtonDiv
  );
}
