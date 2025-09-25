// This file is part of invenio-app-rdm.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio-app-rdm is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import i18n from "i18next";

import LanguageDetector from "i18next-browser-languagedetector";
import { translations } from "./messages";
import { initReactI18next } from "react-i18next";

const { languages } = require("./package.json").config;

const options = {
  fallbackLng: "en", // fallback keys
  returnEmptyString: false,
  debug: process.env.NODE_ENV === "development",
  resources: translations,
  keySeparator: false,
  nsSeparator: false,
  // specify language detection order
  detection: {
    order: ["htmlTag"],
    // cache user language off
    caches: [],
  },
  react: {
    // Set empty - to allow html tags convert to trans tags
    // HTML TAG | Trans TAG
    //  <span>  | <1>
    transKeepBasicHtmlNodesFor: [],
  },
};

const i18next = i18n.createInstance();
i18next.use(LanguageDetector).use(initReactI18next).init(options);


languages.forEach(async (lng) => {
  try {
    const overridenTranslations =  require(`@overriden_translations/${lng}/LC_MESSAGES/translations.json`);
    i18next.addResourceBundle(lng, "translation", overridenTranslations);
  } catch (e) {
    console.log("No overridden translations found for language", lng);
  }
});

export { i18next };
