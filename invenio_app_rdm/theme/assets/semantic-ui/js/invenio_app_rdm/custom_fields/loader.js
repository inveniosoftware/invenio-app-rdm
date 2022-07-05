import React from "react";

export async function loadComponent(prefix, { ui_widget: UIWidget, field, props }) {
  let component = null;
  try {
    // First look into the prefixed path for the component i.e check if user defined them
    const module = await import(`@templates/${prefix}/${UIWidget}.js`);
    component = module.default ?? module[UIWidget];
  } catch (error) {
    try {
      // If not then look into the local path for the component
      const module = await import(`./index.js`);
      component = module[`CF${UIWidget}`];
    } catch (error) {
      console.error(`Failed to import default component ${UIWidget}.js`);
    }
  }
  if (component) {
    return React.createElement(component, {
      ...props,
      key: field,
      fieldPath: `custom_fields.${field}`,
    });
  }
}

function importCustomFieldsWidgets(folder, customFields) {
  const tplPromises = [];
  customFields.forEach((customField) => {
    tplPromises.push(loadComponent(folder, customField));
  });
  return Promise.all(tplPromises);
}

export async function loadCustomFieldsWidgets(config) {
  const sections = [];
  for (const sectionCfg of config) {
    // Path to end user's folder defining custom fields ui widgets
    const fields = await importCustomFieldsWidgets("custom_fields", sectionCfg.fields);
    sections.push({ ...sectionCfg, fields });
  }
  return sections;
}
