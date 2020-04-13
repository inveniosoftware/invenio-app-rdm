import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "formik";
import { Accordion, Form, Icon } from "semantic-ui-react";

export class AccordionField extends Component {
  state = { active: false };

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
            {hasError && <Icon className="error" name="exclamation triangle" />}
            <label>{this.props.label}</label>
            <span>{active ? this.iconActive : this.iconInactive}</span>
          </Accordion.Title>
          <Accordion.Content active={active}>
            {active && this.props.content}
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
  content: PropTypes.object.isRequired,
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
};

AccordionField.defaultProps = {
  label: "",
  required: false,
};
