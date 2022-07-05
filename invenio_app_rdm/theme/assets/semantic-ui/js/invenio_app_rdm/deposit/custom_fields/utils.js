import React from "react";
import _isString from "lodash/isString";

// Path to end user's folder defining custom fields ui widgets
const USER_CUSTOM_FIELDS_FOLDER = "deposit/custom_fields";

export async function loadComponent(prefix, { ui_widget, field, ...props }) {
  let component = null;
  try {
    // First look into the prefixed path for the component i.e check if user defined them
    const module = await import(`@templates/${prefix}/${ui_widget}.js`);
    component = module.default;
  } catch (error) {
    try {
      // If not then look into the local path for the component
      const module = await import(`./${ui_widget}.js`);
      component = module.default;
    } catch (error) {
      console.error(`Failed to import default component ${ui_widget}.js`);
    }
  } finally {
    if (component) {
      return React.createElement(component, { ...props, key: field, fieldPath: `custom.${field}` });
    }
  }
}

function importCustomFields(customFields) {
  const tplPromises = [];
  customFields.forEach((customField) => {
    tplPromises.push(loadComponent(USER_CUSTOM_FIELDS_FOLDER, customField));
  });
  return Promise.all(tplPromises);
}

export async function loadCustomFields(config) {
  const sections = [];
  for (const section_cfg of config) {
    let fields = await importCustomFields(section_cfg.fields);
    sections.push({...section_cfg, fields})
  }
  return sections;
}
