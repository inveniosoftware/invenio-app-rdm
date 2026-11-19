// SPDX-FileCopyrightText: 2026 KTH Royal Institute of Technology.
// SPDX-License-Identifier: MIT

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const i18next = require("i18next");

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
