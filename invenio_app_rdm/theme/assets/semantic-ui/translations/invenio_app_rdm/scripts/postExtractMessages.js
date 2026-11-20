/*
 * SPDX-FileCopyrightText: 2025-2026 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

const { execSync } = require("child_process");
const { writeFileSync } = require("fs");
const packageJson = require("../package");

/**
 * Post-processing script for extracted messages
 * Converts translations.json to .pot and .po formats and fixes trailing newlines
 */

const commands = [
  // Convert to .pot format
  "i18next-conv --compatibilityJSON v4 -l en -s ./messages/en/translations.json -t ./translations.pot",
  // Convert to .po format
  "i18next-conv --compatibilityJSON v4 -l en -s ./messages/en/translations.json -t ./messages/en/messages.po",
  // Fix trailing newlines
  "node scripts/fixTrailingNewlines.js",
];

console.log("📝 Post-processing extracted messages...");

// Retain only "en" in the "languages" field of package.json
// Removes leftover entries created by "npm run init_catalog lang <lang>"
try {
  if (packageJson?.config && packageJson.config.languages.length > 1) {
    console.log('🧹 Forcing languages to ["en"] in package.json...');
    packageJson.config.languages = ["en"];
    const jsonString = JSON.stringify(packageJson, null, 2).replace(
      /"languages": \[\s+"en"\s+\]/,
      '"languages": ["en"]'
    );

    writeFileSync("package.json", jsonString);
    console.log('✅ Languages set to ["en"] successfully!');
  }
} catch (err) {
  console.error("❌ Failed to set languages:", err.message);
  process.exit(1);
}

commands.forEach((command, index) => {
  try {
    console.log(`⚙️  Step ${index + 1}/${commands.length}: ${command}`);
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
  } catch (error) {
    console.error(`❌ Failed to execute: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
});

console.log("✅ Post-processing completed successfully!");
