// This file is part of invenio-app-rdm.
// Copyright (C) 2025 KTH Royal Institute of Technology.
//
// invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

const { execSync } = require("child_process");

/**
 * Post-processing script for extracted messages
 * Converts translations.json to .pot and .po formats and fixes trailing newlines
 */

const commands = [
  // Convert to .pot format
  "i18next-conv -l en -s ./messages/en/translations.json -t ./translations.pot",
  // Convert to .po format
  "i18next-conv -l en -s ./messages/en/translations.json -t ./messages/en/messages.po",
  // Fix trailing newlines
  "node scripts/fixTrailingNewlines.js",
];

console.log("📝 Post-processing extracted messages...");

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
