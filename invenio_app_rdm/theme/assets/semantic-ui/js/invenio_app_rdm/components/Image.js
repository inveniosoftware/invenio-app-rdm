// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";

export class Image extends Component {
  render() {
    const { src, fallbackSrc, className } = this.props;
    return (
      <div className={className}>
        {/* Using directly <img> component to use the onError feature.*/}
        <img
          src={src}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = fallbackSrc;
          }}
        />
      </div>
    );
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Image.defaultProps = {
  className: "",
};
