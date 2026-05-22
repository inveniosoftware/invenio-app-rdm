/*
 * SPDX-FileCopyrightText: 2023 CERN.
 * SPDX-License-Identifier: MIT
 */

import { overriddenComponents } from "./mapping";

import { overrideStore } from "react-overridable";

for (const [key, value] of Object.entries(overriddenComponents)) {
  overrideStore.add(key, value);
}
