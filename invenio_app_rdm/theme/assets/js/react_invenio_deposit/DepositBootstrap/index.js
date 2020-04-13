import { connect } from "react-redux";
import { publish, save, submitAction } from "../state/actions";
import DepositBootstrapComponent from "./DepositBootstrap";

const mapStateToProps = (state) => ({
  record: state.deposit.record,
  formAction: state.deposit.formAction,
});

const mapDispatchToProps = (dispatch) => ({
  publish: (record, formik) => dispatch(publish(record, formik)),
  save: (record, formik) => dispatch(save(record, formik)),
});

export const DepositBootstrap = connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositBootstrapComponent);
