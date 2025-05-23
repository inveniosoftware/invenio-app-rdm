/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { Component } from "react";
import { Button, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";
import ReactJson from "react-json-view";

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
