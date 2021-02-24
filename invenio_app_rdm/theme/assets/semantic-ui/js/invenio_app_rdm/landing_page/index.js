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

import { RecordManagement } from "./recordManagement";

if (document.getElementById("recordManagement")) {
  ReactDOM.render(
    <RecordManagement />,
    document.getElementById("recordManagement")
  );

  $(document).ready(function () {
    $(".ui.accordion").accordion();

    $("#record-doi-badge").click(function () {
      $("#doi-modal").modal("show");
    });

    $(".ui.tooltip-popup").popup();
  });

  $(".preview-link").on("click", function (event) {
    $("#preview")
      .find(".title .filename")
      .html($(event.target).data("fileKey"));
    $("#preview").accordion("open", 0);
    $("#preview-iframe").attr("src", $(event.target).data("url"));
  });

  $("#jump-btn").on("click", function (event) {
    document.documentElement.scrollTop = 0;
  });

  // func to toggle the icon class
  $(".panel-heading").click(function () {
    $("i", this).toggleClass("down right");
  });
}
