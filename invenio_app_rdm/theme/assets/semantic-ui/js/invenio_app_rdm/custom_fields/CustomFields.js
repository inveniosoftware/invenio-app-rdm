import React, { Component } from "react";
import PropTypes from "prop-types";
import { loadCustomFieldsWidgets } from "./loader";
import { AccordionField } from "react-invenio-forms";

export class CustomFields extends Component {
  state = { sections: [] };

  componentDidMount() {
    const { config } = this.props;
    // use of `Promise.then()` as eslint is giving an error when calling setState() directly
    // in the componentDidMount() method
    loadCustomFieldsWidgets(config)
      .then((sections) => {
        this.setState({ sections });
      })
      .catch((error) => {
        console.error("Couldn't load custom fields widgets.", error);
      });
  }

  render() {
    const { sections } = this.state;
    return (
      <>
        {sections.map(({ section, fields }) => (
          <AccordionField
            key={section}
            includesPaths={[fields.map((field) => `custom_fields.${field.key}`)]}
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

CustomFields.propTypes = {
  config: PropTypes.arrayOf(
    PropTypes.shape({
      section: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          field: PropTypes.string.isRequired,
          ui_widget: PropTypes.string.isRequired,
          props: PropTypes.object,
        })
      ),
    })
  ).isRequired,
};
