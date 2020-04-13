import React, { Component } from 'react';

export class DepositField extends Component {
  render() {
    return (
      <div>
        <span><span>icon={this.props.icon}</span><span>label={this.props.label}</span></span>
        <span>{this.props.children}</span>
      </div>
    );
  }
}
