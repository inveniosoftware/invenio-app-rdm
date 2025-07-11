// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popup } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SimpleCopyButton extends React.Component {

  fetchUrl = async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  }

  handleClick = async () => {
    const { url, text, onCopy } = this.props;
    let textToCopy = text;
    if (url) {
      textToCopy = await this.fetchUrl(url);
    }

    await navigator.clipboard.writeText(textToCopy);
    onCopy(text);
  }

  render() {
    const { hoverState } = this.props;

    return (
      <Button
        className="copy"
        basic
        icon="copy"
        aria-label={i18next.t("Copy to clipboard")}
        onClick={this.handleClick} // Handle click to update text if needed, otherwise use text from props
        onMouseEnter={hoverState}
        onMouseLeave={hoverState}
      />
    );
  }
}

SimpleCopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  onCopy: PropTypes.func.isRequired,
  url: PropTypes.func,
  hoverState: PropTypes.func,
};

SimpleCopyButton.defaultProps = {
  hoverState: null,
  url: null,
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
    const { popUpPosition, text, url } = this.props;
    const { confirmationPopupMsg, confirmationPopupIsOpen, hoverPopupIsOpen } =
      this.state;

    return (
      (text || url) && ( // Ensure text or url is provided
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
              url={url}
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
  url: PropTypes.func,
};

CopyButton.defaultProps = {
  popUpPosition: "right center",
  text: "",
  url: "",
};
