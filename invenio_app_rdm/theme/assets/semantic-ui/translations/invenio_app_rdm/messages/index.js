// Copyright (C) 2024 Graz University of Technology.
// Copyright (C) 2025 KTH Royal Institute of Technology

/*
This will import translations from an auto-generated file in order to not have to manually adapt the provided languages.
The auto generated file will be created when running npm run compile_catalog
File structure of the generated file will look like:
import TRANSLATE_de from "./de/translations.json";
import TRANSLATE_en from "./en/translations.json";
import TRANSLATE_es from "./es/translations.json";
export const translations = {
  de: { translation: TRANSLATE_de },
  en: { translation: TRANSLATE_en },
  es: { translation: TRANSLATE_es },
};
*/

import { translations } from "./_generatedTranslations";

export { translations };
