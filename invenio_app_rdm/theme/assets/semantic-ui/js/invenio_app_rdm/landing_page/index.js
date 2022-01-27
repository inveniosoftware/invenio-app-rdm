// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";

import { RecordManagement } from "./RecordManagement";
import { RecordVersionsList } from "./RecordVersionsList";
import { RecordCitationField } from "./RecordCitationField";

const recordManagementAppDiv = document.getElementById("recordManagement");
const recordVersionsAppDiv = document.getElementById("recordVersions");
const recordCitationAppDiv = document.getElementById("recordCitation");

if (recordManagementAppDiv) {
  ReactDOM.render(
    <RecordManagement
      record={JSON.parse(recordManagementAppDiv.dataset.record)}
      permissions={JSON.parse(recordManagementAppDiv.dataset.permissions)}
    />,
    recordManagementAppDiv
  );
}

if (recordVersionsAppDiv) {
  ReactDOM.render(
    <RecordVersionsList
      record={JSON.parse(recordVersionsAppDiv.dataset.record)}
      isPreview={JSON.parse(recordVersionsAppDiv.dataset.preview)}
    />,
    recordVersionsAppDiv
  );
}

if (recordCitationAppDiv) {
  ReactDOM.render(
    <RecordCitationField
      record={JSON.parse(recordCitationAppDiv.dataset.record)}
      styles={JSON.parse(recordCitationAppDiv.dataset.styles)}
      defaultStyle={JSON.parse(recordCitationAppDiv.dataset.defaultstyle)}
    />,
    recordCitationAppDiv
  );
}

$(".ui.accordion").accordion({
  selector: {
    trigger: '.title'
  }
});

$('.ui.accordion .title')
  .on('keydown', function(event) {
    if($(event.target).is('.title') && event.key === "Enter") {
      let classList = Array.from(event.target.classList);

      if(classList.indexOf('active') > -1) {
        $(event.target).accordion('close');
      }
      else {
        $(event.target).accordion('open');
      }
    }
  });

$(".ui.accordion.affiliations-accordion").accordion({
  selector: {
    trigger: '.title .affiliations-button'
  }
});


$("#record-doi-badge").on('click', function () {
  $("#doi-modal").modal("show");
});

$(".ui.tooltip-popup").popup();

$(".preview-link").on("click", function (event) {
  $("#preview").find(".title").html(event.target.dataset.fileKey);
});

$("#jump-btn").on("click", function (event) {
  document.documentElement.scrollTop = 0;
});

// func to toggle the icon class
$(".panel-heading").on('click', function () {
  $("i", this).toggleClass("down right");
});


// Export dropdown on landing page
$(".dropdown.export").dropdown({
  action: 'activate',
  onChange: function(value, text, $selectedItem) {
    $(".export.button").attr("href", value);

    $("#export-select-box").attr("aria-activedescendant", $selectedItem.attr('id'));
    $('.dropdown.export .menu .item').attr("aria-selected", false);
    $($selectedItem).attr("aria-selected", true);
  }
})


// Tab menu
$('.menu .item').tab({
  'onVisible': function(tab){
    $('.menu .item').attr("aria-selected", false);
    $(`#${tab}-tab`).attr("aria-selected", true);

    $('.tab.segment').attr("hidden", true);
    $(`#${tab}`).attr("hidden", false);
  }
});

$('.menu .item')
  .on('keydown', function(event) {
    if(event.key === "Enter") {
      let dataTab = event.target.attributes['data-tab'];
      let tabName = dataTab && dataTab.value;
      $(event.target).tab('change tab', tabName);
    }
  });
