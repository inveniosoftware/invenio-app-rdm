// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import $ from "jquery";

$("#record-doi-badge").on("click", function () {
  $("#doi-modal").modal("show");
});

$(".preview-link").on("click", function (event) {
  $("#preview").find("#preview-file-title").html(event.target.dataset.fileKey);
});


// Export dropdown on landing page
$(".dropdown.export").dropdown({
  action: "activate",
  onChange: function (value, text, $selectedItem) {
    $(".export.button").attr("href", value);

    $("#export-select-box").attr(
      "aria-activedescendant",
      $selectedItem.attr("id")
    );
    $(".dropdown.export .menu .item").attr("aria-selected", false);
    $($selectedItem).attr("aria-selected", true);
  },
});


const $licensesPopup = $('#licenses li.has-popup .license.clickable');

// Licenses description popup
$licensesPopup
  .popup({
    on: 'click',
    popup: '.licenses-description',
    position: 'top right',
    onVisible: function($module) {
      $($module).attr('aria-expanded', true);
    },
    onHidden: function($module) {
      $($module).attr('aria-expanded', false);
    }
  });

$licensesPopup
  .on('keydown', function(event) {
    if(event.key === "Enter") {
      $('#licenses li.has-popup .license.clickable').popup('hide');
      $(event.target).popup('show');
    }
  });


$('#licenses .licenses-description .close.icon')
  .on({
    'click': function(event) {
      $('#licenses li.has-popup .license.clickable').popup('hide');
    },
    'keydown': function(event) {
      if(event.key === "Enter") {
        $('#licenses li.has-popup .license.clickable').popup('hide');
      }
    }
  });


// Record management popup (mobile)
$('#manage-record-btn')
.popup({
  popup: $('#recordManagementMobile'),
  on: 'click',
  position: 'bottom right',
  onVisible: function($module) {
    $($module).attr('aria-expanded', true);
  },
  onHidden: function($module) {
    $($module).attr('aria-expanded', false);
  }
})
