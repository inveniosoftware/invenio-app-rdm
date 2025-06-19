// This file is part of invenio-app-rdm.
// Copyright (C) 2021-2024 Graz University of Technology.
// Copyright (C) 2025 KTH Royal Institute of Technology.
//
// Invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs");
const { gettextToI18next } = require("i18next-conv");
const path = require("path");

const PACKAGE_MESSAGES_PATH = "./messages";
const PO_FILENAME = "messages.po";
const JSON_FILENAME = "translations.json";
const GENERATED_FILE = "_generatedTranslations.js";

// it accepts the same options as the cli.
// https://github.com/i18next/i18next-gettext-converter#options
const options = {
  /* your options here */
};

async function compileAndCreateFileForLanguage(parentPath, lang) {
  const poFilePath = path.join(parentPath, lang, PO_FILENAME);
  const jsonFilePath = path.join(parentPath, lang, JSON_FILENAME);

  if (!existsSync(poFilePath)) {
    console.warn(`❌ Skipping ${lang}: ${PO_FILENAME} not found.`);
    return false;
  }

  try {
    const poContent = readFileSync(poFilePath);
    const result = await gettextToI18next(lang, poContent, options);
    const parsed = JSON.parse(result);
    const prettyJSON = JSON.stringify(parsed, null, 2) + "\n";
    writeFileSync(jsonFilePath, prettyJSON);
    console.log(`✅ Successfully converted ${lang}/${PO_FILENAME} to ${JSON_FILENAME}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${lang}:`, error.message);
    return false;
  }
}

function writeGeneratedTranslationsFile(languages) {
  const generatedPath = path.join(PACKAGE_MESSAGES_PATH, GENERATED_FILE);
  let content = "// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY\n";
  content += "// This file exports all available translations for i18next\n\n";

  // Generate imports
  languages.forEach((lang) => {
    const varName = lang.toUpperCase().replace(/-/g, "_");
    content += `import TRANSLATE_${varName} from "./${lang}/${JSON_FILENAME}";\n`;
  });

  // Generate exports
  content += "\nexport const translations = {\n";
  languages.forEach((lang) => {
    const varName = lang.toUpperCase().replace(/-/g, "_");
    content += `  ${lang}: { translation: TRANSLATE_${varName} },\n`;
  });
  content += "};\n";

  writeFileSync(generatedPath, content);
  console.log(`📁 Generated translation index at ${GENERATED_FILE}`);
}

async function processAllLanguages() {
  const directories = readdirSync(PACKAGE_MESSAGES_PATH, {
    withFileTypes: true,
  })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const processedLangs = [];
  for (const lang of directories) {
    const success = await compileAndCreateFileForLanguage(PACKAGE_MESSAGES_PATH, lang);
    if (success) processedLangs.push(lang);
  }
  return processedLangs;
}

async function handleLanguageCommand(lang) {
  const success = await compileAndCreateFileForLanguage(PACKAGE_MESSAGES_PATH, lang);
  if (!success) process.exit(1);

  const directories = readdirSync(PACKAGE_MESSAGES_PATH, {
    withFileTypes: true,
  })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  const validLangs = directories.filter((l) =>
    existsSync(path.join(PACKAGE_MESSAGES_PATH, l, JSON_FILENAME))
  );
  writeGeneratedTranslationsFile(validLangs);
}

// Main execution flow
// self-executing function for coordinating async on the top level
// and to avoid using .then() and .catch().
// operations with centralized error handling.
(async () => {
  try {
    if (process.argv[2] === "lang") {
      const lang = process.argv[3];
      if (!lang) throw new Error("Missing language code e.g. 'sv', 'ar', etc.");
      await handleLanguageCommand(lang);
    } else {
      const processedLangs = await processAllLanguages();
      writeGeneratedTranslationsFile(processedLangs);
    }
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
})();
