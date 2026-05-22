/*
 * SPDX-FileCopyrightText: 2025 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import $ from "jquery";

const channel = new BroadcastChannel("invenio-previewer-zip");

$(".preview-link").on("click", function (e) {
  e.preventDefault();
  const fileKey = $(this).data("file-key");
  const previewUrl = $(this).data("preview-url");
  const containerFileKey = $(this).data("container-file-key");
  const containerPreviewUrl = window.location.href;
  channel.postMessage({
    fileKey: fileKey,
    previewUrl: previewUrl,
    containerFileKey: containerFileKey,
    containerPreviewUrl: containerPreviewUrl,
  });
  console.log(
    `[${containerFileKey} at ${containerPreviewUrl}] Requested preview for fileKey: ${fileKey} with URL: ${previewUrl}`
  );
});
