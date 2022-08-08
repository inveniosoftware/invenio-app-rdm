import React, { Component } from "react";
import { loadCustomFields } from "./utils";
import { AccordionField } from "react-invenio-forms";

export class CustomFields extends Component {
  state = { sections: [] };

  async componentDidMount() {
    // Custom fields
    loadCustomFields(this.props.config).then((sections) => {
      this.setState({ sections });
    });
  }

  render() {
    const { sections } = this.state;
    return (
      <>
        {sections.map(({section, fields}) => (<AccordionField
            key={section}
            includesPaths={[fields.map(field => `custom_fields.${field.key}`)]}
            label={section}
            active
          >
            {fields}
          </AccordionField>
        ))}
      </>
    );
  }
}
