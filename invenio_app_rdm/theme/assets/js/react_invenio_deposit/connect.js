// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { connect as reduxConnect } from "react-redux";

export function connect(Component) {
  const WrappedComponent = ({ dispatch, ...props }) => {
    return <Component {...props} />;
  };
  const mapStateToProps = (state) => ({
    deposit: state.deposit,
  });

  return reduxConnect(mapStateToProps, null)(WrappedComponent);
}
