import { connect } from "react-redux";
import { submitAction } from "../../state/actions";
import SaveButtonComponent from "./SaveButton";

const mapDispatchToProps = (dispatch) => ({
  saveClick: (event, formik) => dispatch(submitAction("save", event, formik)),
});

export const SaveButton = connect(
  null,
  mapDispatchToProps
)(SaveButtonComponent);
