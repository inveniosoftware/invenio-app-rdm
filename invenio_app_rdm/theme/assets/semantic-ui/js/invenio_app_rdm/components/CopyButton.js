// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popup } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SimpleCopyButton extends React.Component {
  render() {
    const { text, onCopy, hoverState } = this.props;

    return (
      <CopyToClipboard
        text={text}
        onCopy={() => {
          onCopy(text);
        }}
      >
        <Button
          className="copy"
          basic
          icon="copy"
          aria-label={i18next.t("Copy to clipboard")}
          onMouseEnter={hoverState}
          onMouseLeave={hoverState}
        />
      </CopyToClipboard>
    );
  }
}

SimpleCopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
  hoverState: PropTypes.func,
};

SimpleCopyButton.defaultProps = {
  hoverState: null,
};

export class CopyButton extends Component {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      confirmationPopupIsOpen: false,
      confirmationPopupMsg: "",
      hoverPopupIsOpen: false,
      stateReset: null,
    };
    this.state = this.INITIAL_STATE;
  }

  componentWillUnmount() {
    const { stateReset } = this.state;
    // Avoid state update after component is unmounted:
    if (stateReset) clearTimeout(stateReset);
  }

  onCopy = () => {
    this.setState(() => ({
      confirmationPopupIsOpen: true,
      confirmationPopupMsg: i18next.t("Copied!"),
    }));

    this.delayClosePopup();
  };

  delayClosePopup = () => {
    let stateReset = setTimeout(() => {
      this.setState(this.INITIAL_STATE);
    }, 1500);

    this.setState({ stateReset });
  };

  hoverStateHandler = (event) => {
    event.persist();
    if (event.type === "mouseenter") this.setState({ hoverPopupIsOpen: true });
    if (event.type === "mouseleave") this.setState({ hoverPopupIsOpen: false });
  };

  render() {
    const { text, popUpPosition } = this.props;
    const { confirmationPopupMsg, confirmationPopupIsOpen, hoverPopupIsOpen } =
      this.state;

    return (
      text && (
        <Popup
          role="alert"
          open={hoverPopupIsOpen || confirmationPopupIsOpen}
          content={confirmationPopupMsg || i18next.t("Copy to clipboard")}
          inverted={!!confirmationPopupMsg}
          position={popUpPosition}
          size="mini"
          trigger={
            <SimpleCopyButton
              text={text}
              onCopy={this.onCopy}
              hoverState={this.hoverStateHandler}
            />
          }
        />
      )
    );
  }
}

CopyButton.propTypes = {
  popUpPosition: PropTypes.string,
  text: PropTypes.string,
};

CopyButton.defaultProps = {
  popUpPosition: "right center",
  text: "",
};
