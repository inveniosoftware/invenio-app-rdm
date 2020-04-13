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
