import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "formik";
import { Button, Container } from "semantic-ui-react";

export class ActionButton extends Component {
  render() {
    const { name, content, isDisabled, ...uiProps } = this.props;
    return (
      <Container>
        <Field>
          {({ form: formik }) => (
            <Button
              disabled={isDisabled(formik)}
              name={name}
              content={content}
              type="button"
              {...uiProps} // able to override above props
              onClick={(e) => this.props.onClick(e, formik)}
            >
              {this.props.children ? this.props.children(formik) : null}
            </Button>
          )}
        </Field>
      </Container>
    );
  }
}

ActionButton.propTypes = {
  name: PropTypes.string,
  content: PropTypes.string,
  isDisabled: PropTypes.func,
  uiProps: PropTypes.any,
  children: PropTypes.func,
};
