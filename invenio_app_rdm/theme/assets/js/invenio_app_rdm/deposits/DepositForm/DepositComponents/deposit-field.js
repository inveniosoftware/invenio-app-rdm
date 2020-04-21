import React, { Component } from 'react';
import { Form } from 'semantic-ui-react'


export class DepositField extends Component {
  // TODO: Investigate appropriate abstraction
  render() {
    return (
      <Form.Field inline>
        {this.props.children}
      </Form.Field>
    );
  }
}