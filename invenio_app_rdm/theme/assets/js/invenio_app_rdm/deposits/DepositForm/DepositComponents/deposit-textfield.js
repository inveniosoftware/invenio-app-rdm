import React, { Component } from 'react';
import { DepositField } from './deposit-field';

export class DepositTextField extends Component {
  render() {
    return (
      <DepositField icon={this.props.icon} label={this.props.label}>
        <input type="text" />
      </DepositField>
    );
  }
}
