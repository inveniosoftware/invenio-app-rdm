import React, { Component } from 'react';
import { DepositField } from './deposit-field';
import { Input, Form } from 'semantic-ui-react'


export class DepositTextField extends Component {
  render() {
    return (
      <DepositField icon={this.props.icon} label={this.props.label}>
        <Input type="text" />
      </DepositField>
    );
  }
}


// <TextField
//   fieldPath="contact"
//   placeholder="Enter a new contact"
//   label="Contact"
//   fluid="true"
//   required
// />
