import React, { Component } from 'react';

export class DepositSection extends Component {
  render() {
    return (
      <div> {/*SECTION*/}
        {this.props.header}
        {this.props.children}
      </div>
    );
  }
}
