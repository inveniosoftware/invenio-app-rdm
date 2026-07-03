/*
 * SPDX-FileCopyrightText: 2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import { Component } from "react";
import { Button, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";
import ReactJson from "@microlink/react-json-view";

export class ViewJson extends Component {
  render() {
    const { jsonData, onCloseHandler } = this.props;
    return (
      <>
        <Modal.Content>
          <Modal.Description>
            <ReactJson src={jsonData} name={null} />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onCloseHandler}>Close</Button>
        </Modal.Actions>
      </>
    );
  }
}

ViewJson.propTypes = {
  jsonData: PropTypes.object.isRequired,
  onCloseHandler: PropTypes.object.isRequired,
};
