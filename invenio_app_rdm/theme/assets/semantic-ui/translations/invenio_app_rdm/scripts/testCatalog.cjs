// SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
// SPDX-License-Identifier: MIT

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { Parser } = require("i18next-scanner");
const { options } = require("../i18next-scanner.config.js");

function assertExtractedMessages(filename, messages) {
  const parser = new Parser({ ...options, debug: false });
  const sourceRoot = path.resolve(__dirname, "../../../js");
  const source = fs.readFileSync(path.join(sourceRoot, filename), "utf8");
  parser.parseFuncFromString(source);
  parser.parseTransFromString(source);
  const extracted = parser.get().en.translations;
  for (const message of messages) {
    assert.ok(
      Object.hasOwn(extracted, message) || Object.hasOwn(extracted, `${message}_one`),
      `${filename}: missing ${message}`
    );
  }
}

test("extract ImpersonateUserForm messages", () => {
  assertExtractedMessages("invenio_app_rdm/administration/components/ImpersonateUserForm.js", [
  "You are about to impersonate user <bold>{{email}} (id: {{id}})</bold>.",
  "You <bold>MUST</bold> logout after completing your inquiry."
]);
});
