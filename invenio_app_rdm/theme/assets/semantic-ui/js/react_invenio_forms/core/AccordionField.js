// This file is part of React-Invenio-Forms
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Forms is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "formik";
import { Accordion, Form, Icon } from "semantic-ui-react";

export class AccordionField extends Component {
  constructor(props) {
    super(props);
    this.state = { active: props.active || false };
  }

  iconActive = (
    <Icon name="angle down" size="large" style={{ float: "right" }} />
  );

  iconInactive = (
    <Icon name="angle right" size="large" style={{ float: "right" }} />
  );

  handleClick = (showContent) => {
    this.setState({ active: !showContent });
  };

  hasError(errors) {
    if (this.props.fieldPath in errors) {
      return true;
    }
    for (const errorPath in errors) {
      if (errorPath.startsWith(this.props.fieldPath)) {
        return true;
      }
    }
    return false;
  }

  renderAccordion = (props) => {
    const {
      form: { errors, status },
    } = props;
    const { active } = this.state;
    const hasError = status ? this.hasError(status) : this.hasError(errors);

    return (
      <Accordion fluid index={0}>
        <Form.Field required={this.props.required}>
          <Accordion.Title as="label" onClick={() => this.handleClick(active)}>
            {hasError && <Icon color="red" name="exclamation triangle" />}
            <label>{this.props.label}</label>
            <span>{active ? this.iconActive : this.iconInactive}</span>
          </Accordion.Title>
          <Accordion.Content active={active}>
            {active && this.props.children}
          </Accordion.Content>
        </Form.Field>
      </Accordion>
    );
  };

  render() {
    return (
      <Field name={this.props.fieldPath} component={this.renderAccordion} />
    );
  }
}

AccordionField.propTypes = {
  active: PropTypes.bool,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
};

AccordionField.defaultProps = {
  active: false,
  label: "",
  required: false,
};
