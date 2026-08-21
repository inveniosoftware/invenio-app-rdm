/*
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-License-Identifier: MIT
 */

const { writeFileSync } = require("fs");
const packageJson = require("../package");

const { languages } = packageJson.config;
if ("lang" === process.argv[2]) {
  const addedLang = process.argv[3];
  languages.push(addedLang);
  packageJson.config.languages = [...new Set(languages)];
  writeFileSync(`package.json`, JSON.stringify(packageJson, null, 2));
} else {
  console.error(
    "Error:Please provide a language by running `npm run init_catalog lang <lang>`"
  );
}
