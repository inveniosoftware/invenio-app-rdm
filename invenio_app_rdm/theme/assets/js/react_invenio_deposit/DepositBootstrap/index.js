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
