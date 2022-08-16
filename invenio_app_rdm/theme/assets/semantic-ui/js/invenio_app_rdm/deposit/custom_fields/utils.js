import React from "react";

// Path to end user's folder defining custom fields ui widgets
const USER_CUSTOM_FIELDS_FOLDER = "deposit/custom_fields";

export async function loadComponent(prefix, { ui_widget: UIWidget, field, props }) {
  let component = null;
  try {
    // First look into the prefixed path for the component i.e check if user defined them
    const module = await import(`@templates/${prefix}/${UIWidget}.js`);
    component = module.default;
  } catch (error) {
    try {
      // If not then look into the local path for the component
      const module = await import(`./${UIWidget}.js`);
      component = module.default;
    } catch (error) {
      console.error(`Failed to import default component ${UIWidget}.js`);
    }
  } finally {
    if (component) {
      return React.createElement(component, {
        ...props,
        key: field,
        fieldPath: `custom_fields.${field}`,
      });
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
  for (const sectionCfg of config) {
    let fields = await importCustomFields(sectionCfg.fields);
    sections.push({ ...sectionCfg, fields });
  }
  return sections;
}
