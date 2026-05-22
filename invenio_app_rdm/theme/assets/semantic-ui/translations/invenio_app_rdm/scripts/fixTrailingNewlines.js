/*
 * SPDX-FileCopyrightText: 2025 CERN.
 * SPDX-FileCopyrightText: 2025 KTH Royal Institute of Technology.
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");

const files = ["./translations.pot", "./messages/en/messages.po"];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️ File not found: ${file}`);
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  if (!content.endsWith("\n")) {
    fs.appendFileSync(file, "\n");
    console.log(`🔧 Appended trailing newline to: ${file}`);
  }
}
