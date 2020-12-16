// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import $ from "jquery";

$(".preview-link").on("click", function (event) {
  $("#preview").find(".title .filename").html($(event.target).data("fileKey"));
  $("#preview").accordion("open", 0);
  $("#preview-iframe").attr("src", $(event.target).data("url"));
});

$(document).ready(function () {
  $(".ui.accordion").accordion();
});

$(document).ready(function () {
  $("#record-doi-badge").click(function () {
    $("#doi-modal").modal("show");
  });
});

$("#jump-btn").on("click", function (event) {
  document.documentElement.scrollTop = 0;
});

$('.ui.tooltip-popup').popup();
