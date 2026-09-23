/*
 * SPDX-FileCopyrightText: 2025 CESNET i.a.l.e.
 * SPDX-License-Identifier: MIT
 */

import $ from "jquery";

window.addEventListener("message", onMessage);

function onMessage(msg) {
  if (msg.origin !== window.location.origin || !msg.ports.length || msg.data?.type !== "invenio-previewer-zip") return;

  const channelId = msg.data?.channelId;
  if (!channelId) return;

  $(".preview-link").on("click", function (e) {
    e.preventDefault();
    const fileKey = $(this).data("file-key");
    const previewUrl = $(this).data("preview-url");
    const containerFileKey = $(this).data("container-file-key");
    const containerPreviewUrl = window.location.href;
    
    msg.ports[0].postMessage({
      type: "invenio-previewer-zip",
      channelId: channelId,
      fileKey: fileKey,
      previewUrl: previewUrl,
      containerFileKey: containerFileKey,
      containerPreviewUrl: containerPreviewUrl,
    });
    console.log(
      `[${containerFileKey} at ${containerPreviewUrl}] Requested preview for fileKey: ${fileKey} with URL: ${previewUrl}`
    );
  });
}
