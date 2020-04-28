// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { connect } from "react-redux";
import { submitFormData } from "../state/actions";
import DepositBootstrapComponent from "./DepositBootstrap";

const mapStateToProps = (state) => ({
  record: state.deposit.record,
  formAction: state.deposit.formAction,
});

const mapDispatchToProps = (dispatch) => ({
  submitFormData: (record, formik) => dispatch(submitFormData(record, formik)),
});

export const DepositBootstrap = connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositBootstrapComponent);
