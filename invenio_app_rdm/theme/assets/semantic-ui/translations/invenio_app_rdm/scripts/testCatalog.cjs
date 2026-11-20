// SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
// SPDX-License-Identifier: MIT

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const i18next = require("i18next");
const { Parser } = require("i18next-scanner");
const { options } = require("../i18next-scanner.config.js");

const source = `msgid ""
msgstr ""
"Language: sv\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"

msgid "Reviewed"
msgstr "Granskad"

#, python-format, fuzzy
msgid "Needs review"
msgstr "Ej granskad"

msgid "item"
msgid_plural "items"
msgstr[0] "Sak"
msgstr[1] "Saker"

msgid "Missing"
msgstr ""
`;

test("compile reviewed entries and v4 plurals; fall back for fuzzy entries", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-catalog-"));
  try {
    const messages = path.join(directory, "messages", "sv");
    fs.mkdirSync(messages, { recursive: true });
    fs.writeFileSync(path.join(messages, "messages.po"), source);
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, "compileCatalog.js")],
      {
        cwd: directory,
        encoding: "utf8",
      }
    );
    assert.equal(result.status, 0, result.stderr);
    const translations = JSON.parse(
      fs.readFileSync(path.join(messages, "translations.json"), "utf8")
    );
    assert.equal(translations.Reviewed, "Granskad");
    assert.equal(translations["Needs review"], undefined);
    assert.equal(translations.Missing, undefined);
    assert.equal(translations.item_one, "Sak");
    assert.equal(translations.item_other, "Saker");
    const runtime = i18next.createInstance();
    await runtime.init({
      lng: "sv",
      fallbackLng: "en",
      debug: false,
      keySeparator: false,
      nsSeparator: false,
      resources: {
        sv: { translation: translations },
        en: {
          translation: { "Needs review": "Needs review", Missing: "Missing" },
        },
      },
    });
    assert.equal(runtime.t("Reviewed"), "Granskad");
    assert.equal(runtime.t("Needs review"), "Needs review");
    assert.equal(runtime.t("Missing"), "Missing");
    assert.equal(runtime.t("item", { count: 1 }), "Sak");
    assert.equal(runtime.t("item", { count: 2 }), "Saker");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

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

test("extract SetQuotaAction messages", () => {
  assertExtractedMessages("invenio_app_rdm/administration/components/SetQuotaAction.js", [
  "<bold>Note:</bold> This is the default quota that will be applied to any NEW records created by this user - it will NOT update quota of existing records."
]);
});

test("extract RestoreConfirmation messages", () => {
  assertExtractedMessages("invenio_app_rdm/administration/records/RestoreConfirmation.js", [
  "Are you sure you want to restore #{{id}} <bold>\"{{title}}\"</bold>?"
]);
});

test("extract SearchResultItemLayout messages", () => {
  assertExtractedMessages("invenio_app_rdm/administration/records/search/SearchResultItemLayout.js", [
  "{{id}} | version {{version}}"
]);
});

test("extract UserActions messages", () => {
  assertExtractedMessages("invenio_app_rdm/administration/users/UserActions.js", [
  "User {{name}} was restored.",
  "User {{name}} was suspended.",
  "User {{name}} was approved.",
  "User {{name}} was activated."
]);
});

test("extract AccessRequestForm messages", () => {
  assertExtractedMessages("invenio_app_rdm/landing_page/AccessRequestForm.js", [
  "We have sent you an email to verify your address. Please check the email and follow the instructions to complete the access request."
]);
});

test("extract RecordCommunitiesList messages", () => {
  assertExtractedMessages("invenio_app_rdm/landing_page/RecordCommunitiesList.js", [
  "Part of <communityLink>{{title}}</communityLink>"
]);
});

test("extract RecordVersionsList messages", () => {
  assertExtractedMessages("invenio_app_rdm/landing_page/RecordVersionsList.js", [
  "<bold>Cite all versions?</bold> You can cite all versions by using the DOI <doiLink>{{doi}}</doiLink>. This DOI represents all versions, and will always resolve to the latest one. <helpLink>Read more</helpLink>.",
  "<bold>Cite all versions?</bold> You can cite all versions by using the DOI {{doi}}. The DOI is registered when the first version is published. <helpLink>Read more</helpLink>."
]);
});

test("extract RemoveFromCommunityAction messages", () => {
  assertExtractedMessages("invenio_app_rdm/landing_page/RemoveFromCommunity/RemoveFromCommunityAction.js", [
  "Members of the community <bold>\"{{communityTitle}}\"</bold> will <underline>lose their access</underline> to the record."
]);
});

test("extract components messages", () => {
  assertExtractedMessages("invenio_app_rdm/search/components.js", [
  "<queryLink>metadata.publication_date:[2025-01-01 TO *]</queryLink> will give you all the publications from 2025 until today.",
  "For more tips, check out our <guideLink>search guide</guideLink> for defining advanced search queries."
]);
});
