// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Button, Icon } from "semantic-ui-react";

import { ArrayField, TextField } from "../../react_invenio_forms";

/**
 * Renders a `titles` field with a schema of
 *  titles: [
 *      {
 *          'title': <string>,
 *          'type': <string>,
 *          'lang': <string>
 *      }
 *  ]
 */
export class TitlesField extends Component {
  render() {
    return (
      <ArrayField
        addButtonLabel={"Add another title"}
        fieldPath={this.props.fieldPath}
        defaultNewValue={this.props.defaultNewValue}
        // <span><Icon disabled name="book" />Title</span>
        label={this.props.label}
      >
        {
          ({ array, arrayHelpers, indexPath, key }) => (
            <Form.Group inline>
              <TextField fieldPath={`${key}.title`} />
              {
                array.length === 1 ?
                null :
                <Button icon>
                  <Icon name="close" size="large" onClick={() => arrayHelpers.remove(indexPath)} />
                </Button>
              }
            </Form.Group>
          )
        }
      </ArrayField>
    );
  }
}

TitlesField.propTypes = {
  label: PropTypes.string.isRequired,
  fieldPath: PropTypes.string.isRequired,
  defaultNewValue: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
};

TitlesField.defaultProps = {
  defaultNewValue: { title: "", type: "", lang: "" },
};
