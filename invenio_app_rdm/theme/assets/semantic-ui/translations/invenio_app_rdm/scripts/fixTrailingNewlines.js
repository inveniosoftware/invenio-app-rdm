// This file is part of invenio-app-rdm.
// Copyright (C) 2025 CERN.
// Copyright (C) 2025 KTH Royal Institute of Technology.
//
// Invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

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
