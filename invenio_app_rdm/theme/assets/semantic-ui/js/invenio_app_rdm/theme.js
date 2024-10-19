// This file is part of InvenioRDM
// Copyright (C) 2024 CERN.
// Copyright (C) 2024 KTH Royal Institute of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import $ from "jquery";
import { MultipleOptionsSearchBar } from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import ReactDOM from "react-dom";
import React from "react";

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

// adding missing accessibility event (change tabs on enter keystroke)
$tabElement.on("keydown", function (event) {
  if (event.key === "Enter") {
    let dataTab = event.target.attributes["data-tab"];
    let tabName = dataTab && dataTab.value;
    $(event.target).tab("change tab", tabName);
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

  ReactDOM.render(
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
  window.invenio.onSearchResultsRendered = () => {
    if (isMathJaxEnabled) {
      // Re-render mathematical content on the page using MathJax.
      return window.MathJax?.typeset();
    }
  };
}
