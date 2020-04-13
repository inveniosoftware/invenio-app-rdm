import { connect } from "react-redux";
import { submitAction } from "../../state/actions";
import PublishButtonComponent from "./PublishButton";

const mapDispatchToProps = (dispatch) => ({
  publichClick: (event, formik) =>
    dispatch(submitAction("publish", event, formik)),
});

export const PublishButton = connect(
  null,
  mapDispatchToProps
)(PublishButtonComponent);
