/*
 * SPDX-FileCopyrightText: 2020-2025 CERN.
 * SPDX-FileCopyrightText: 2020-2021 Northwestern University.
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-FileCopyrightText: 2025-2026 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import $ from "jquery";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { onPreviewBreadcrumb, renderPreviewBreadcrumb } from "../previewer/breadcrumb";

// Normalise a string for diacritic insensitive search: decompose into base chars +
// combining marks, strip the marks, then lower-case while still matching the literal character.
const normalizeSearch = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Checks if the current creatibutor entry matches the search query.
function creatibutorMatchesQuery($wrap, query) {
  if (!query) return true;
  const q = normalizeSearch(query);
  const text = normalizeSearch($wrap.text());
  const affiliations = normalizeSearch(
    $wrap.attr("data-affiliations") ||
      $wrap.find("[data-tooltip]").attr("data-tooltip") ||
      ""
  );
  return text.includes(q) || affiliations.includes(q);
}

// Filters the creatibutors panel (modal) according to the current input value.
function filterCreatibutorsPanel($input) {
  const query = $input.val().trim();
  const $modal = $input.closest(".creatibutors-landing-modal");
  const $panel = $(`#${$input.data("panel")}`);

  let shown = 0;
  const visibleAffiliationRefs = new Set();

  // Walk over all creatibutors and hide those that don't match
  $panel.find(".creatibutor-wrap").each(function () {
    const $wrap = $(this);
    const matches = creatibutorMatchesQuery($wrap, query);
    $wrap.toggleClass("hidden", !matches);
    if (!matches) return;

    shown += 1;
    ($wrap.attr("data-affiliation-refs") || "").split(",").forEach((ref) => {
      const marker = ref.trim();
      if (marker) visibleAffiliationRefs.add(marker);
    });
  });

  $panel.children("div").each(function () {
    const $group = $(this);
    const hasVisible = $group.find(".creatibutor-wrap:not(.hidden)").length > 0;
    $group.toggleClass("hidden", !hasVisible);
  });

  // Update the visible/total count
  const $count = $input
    .closest(".creatibutors-modal-search")
    .find(".creatibutors-filter-count");
  if ($count.length) {
    const total = parseInt($count.data("total"), 10);
    $count.text(`${query ? shown : total} / ${total}`);
  }

  const $affiliationsPanel = $modal.find(".creatibutors-panel-affiliations");
  if (!$affiliationsPanel.length) return;

  // Hide/show affiliations based on what matches the current filtered list
  let visibleAffiliations = 0;
  $affiliationsPanel.find("li[data-affiliation-ref]").each(function () {
    const ref = $(this).attr("data-affiliation-ref");
    const show = visibleAffiliationRefs.has(ref);
    $(this).toggleClass("hidden", !show);
    if (show) visibleAffiliations += 1;
  });
  $affiliationsPanel.toggleClass("hidden", visibleAffiliations === 0);
}

// Every time the user types in the filter box, refilter the panel
$(document).on("input", ".creatibutors-filter-input", function () {
  filterCreatibutorsPanel($(this));
});

$(".creatibutors-landing-modal").modal({
  closable: true,
  onHidden() {
    $(this).find(".creatibutors-filter-input").val("").trigger("input");
  },
  selector: {
    close: ".close",
  },
});

$(document).on("click", ".creatibutors-show-all-link", function (e) {
  e.preventDefault();
  $($(this).data("target")).modal("show");
});

$("#record-doi-badge").on("click", function () {
  $("#doi-modal").modal("show");
});

$("#record-conceptdoi-badge").on("click", function () {
  $("#conceptdoi-modal").modal("show");
});

const previewIframe = document.getElementById("preview-iframe");
const previewTitle = document.getElementById("preview-file-title");

// Navigate the preview iframe without adding entries to the browser history, so that
// the back button navigates the record and not the iframe.
function navigatePreview(url) {
  previewIframe?.contentWindow?.location.replace(url);
}

function showPreviewTrail(trail) {
  renderPreviewBreadcrumb(previewTitle, trail, {
    ariaLabel: i18next.t("Previewed file path"),
    onNavigate: (subTrail) => {
      showPreviewTrail(subTrail);
      navigatePreview(subTrail[subTrail.length - 1].url);
    },
  });
}

// Container previewers (e.g. ZIP) in the iframe post the breadcrumb of the item they open
if (previewIframe && previewTitle) {
  onPreviewBreadcrumb(previewIframe, showPreviewTrail);
}

$("#file-list-table")
  .find(".preview-link")
  .on("click", function (event) {
    event.preventDefault();

    const fileKey = this.dataset.fileKey;
    const previewUrl = this.getAttribute("href");

    const newUrl = new URL(window.location);
    newUrl.searchParams.set("preview_file", fileKey); // .set method automatically encodes the value
    window.history.replaceState(null, "", newUrl);

    if (previewIframe && previewTitle) {
      showPreviewTrail([{ label: fileKey, url: previewUrl }]);
      navigatePreview(previewUrl);

      previewIframe.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      previewIframe.focus();
    }
  });

// Export dropdown on landing page
$(".dropdown.export").dropdown({
  action: "activate",
  onChange: function (value, text, $selectedItem) {
    $(".export.button").attr("href", value);

    $("#export-select-box").attr("aria-activedescendant", $selectedItem.attr("id"));
    $(".dropdown.export .menu .item").attr("aria-selected", false);
    $($selectedItem).attr("aria-selected", true);
  },
});

const $licensesPopup = $("#licenses .has-popup .license.clickable");

// Licenses description popup
$licensesPopup.popup({
  on: "click",
  popup: ".licenses-description",
  position: "top right",
  onVisible: function ($module) {
    $($module).attr("aria-expanded", true);
  },
  onHidden: function ($module) {
    $($module).attr("aria-expanded", false);
  },
});

$licensesPopup.on("keydown", function (event) {
  if (event.key === "Enter") {
    $licensesPopup.popup("hide");
    $(event.target).popup("show");
  }
});

$("#licenses .licenses-description .close.icon").on({
  click: function () {
    $licensesPopup.popup("hide");
  },
  keydown: function (event) {
    if (event.key === "Enter") {
      $licensesPopup.popup("hide");
    }
  },
});

// Record management popup (mobile)
$("#manage-record-btn").popup({
  popup: $("#recordManagementMobile"),
  on: "click",
  position: "bottom right",
  onVisible: function ($module) {
    $($module).attr("aria-expanded", true);
  },
  onHidden: function ($module) {
    $($module).attr("aria-expanded", false);
  },
});

// Statistics table info popup
const $statsInfoPopup = $("#record-statistics .popup-trigger");
const $statsInfoPopupContent = $("#record-statistics .popup-trigger + .popup-content");

$statsInfoPopup.popup({
  on: "hover",
  popup: $statsInfoPopupContent,
  position: "top right",
  onVisible: function ($module) {
    $($module).attr("aria-expanded", true);
  },
  onHidden: function ($module) {
    $($module).attr("aria-expanded", false);
  },
});

$statsInfoPopup.on("focus", function (event) {
  $(event.target).popup("show");
  $(event.target).attr("aria-expanded", true);
});

$statsInfoPopup.on("click", function (event) {
  if ($statsInfoPopupContent.hasClass("hidden")) {
    $(event.target).popup("show");
    $(event.target).attr("aria-expanded", true);
  } else {
    $(event.target).popup("hide");
    $(event.target).attr("aria-expanded", false);
  }
});

$statsInfoPopup.on("blur", function (event) {
  $(event.target).popup("hide");
  $(event.target).attr("aria-expanded", false);
});
