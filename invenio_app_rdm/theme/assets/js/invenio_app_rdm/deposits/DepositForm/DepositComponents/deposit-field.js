import React, { Component } from 'react';
import { Icon, Form } from 'semantic-ui-react'


export class DepositField extends Component {
  render() {
    return (
      <Form.Field inline>
        <label><Icon disabled name={this.props.icon} />{this.props.label}</label>
        {this.props.children}
      </Form.Field>
    );
  }
}
