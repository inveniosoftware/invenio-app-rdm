import React, { Component } from "react";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import { Button, Modal, Message, Icon, Checkbox, Grid } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Trans } from "react-i18next";
import { http, ErrorMessage } from "react-invenio-forms";
import PropTypes from "prop-types";
import { withState } from "react-searchkit";
import { RequestActionController } from "@js/invenio_requests";

class RecordCommunitiesSearchItemComponent extends Component {

  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      modalOpen: false,
      loading: false,
      error: undefined,
      isChecked1: false,
      isChecked2: false,
    };
    this.state = this.INITIAL_STATE;
  }

  handleCheckbox1Change = () => this.setState({ isChecked1: !this.state.isChecked1 });
  handleCheckbox2Change = () => this.setState({ isChecked2: !this.state.isChecked2 });
  handleButtonDisabled = () => !(this.state.isChecked1 && this.state.isChecked2);

  openConfirmModal = () => this.setState({ modalOpen: true });
  closeConfirmModal = () => this.setState(this.INITIAL_STATE);

  handleDelete = async () => {
    const { result, record, currentQueryState, updateQueryState } = this.props;

    this.setState({ loading: true });
    const payload = {
      communities: [{ id: result.id }],
    };

    try {
      await http.delete(`/api/records/${record.id}/communities`, {
        data: payload,
      });
    } catch (e) {
      this.setState({ error: e, loading: false });
      return;
    }

    // trigger a new search with the same query state to refresh the list
    updateQueryState(currentQueryState);

    this.setState({ modalOpen: false });
  };

  render() {
    const { modalOpen, loading, error, isChecked1, isChecked2 } =
      this.state;
    const { result, successCallback } = this.props;
    // const {
    //   expanded: { receiver: community },
    // } = result;

    const communityTitle = result.metadata.title;

    const action = (
      <>
        <RequestActionController
          request={result}
          actionSuccessCallback={successCallback}
        />
        <Button
          size="tiny"
          negative
          labelPosition="left"
          icon="trash"
          floated="right"
          onClick={this.openConfirmModal}
          content={i18next.t("Remove")}
        />
        <Modal size="tiny" dimmer="blurring" open={modalOpen}>
          <Modal.Header>{i18next.t("Remove community")}</Modal.Header>
          <Modal.Content>
            {i18next.t(
              "Are you sure you want to remove the record from the community?"
            )}
          </Modal.Content>
          <Modal.Content>
            <Message negative>
              <Message.Header>
                <Grid columns={2} verticalAlign="middle">
                  <Grid.Column width={1}>
                    <Icon name="warning sign" />
                  </Grid.Column>
                  <Grid.Column width={15}>
                    {i18next.t("I understand the consequences:")}
                  </Grid.Column>
                </Grid>
              </Message.Header>
              <Message.Content>
                <Checkbox
                  label={
                    /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
                    <label>
                      <Trans>
                        Members of the community <b>"{{ communityTitle }}"</b> will{" "}
                        <u>lose their access</u> to the record.
                      </Trans>
                    </label>
                  }
                  checked={isChecked1}
                  onChange={this.handleCheckbox1Change}
                />
                <Checkbox
                  label={i18next.t(
                    "The record can only be re-included in the community by going through a new review by the community curators."
                  )}
                  checked={isChecked2}
                  onChange={this.handleCheckbox2Change}
                />
              </Message.Content>
            </Message>
          </Modal.Content>

          <Modal.Actions>
            {error && (
              <ErrorMessage
                header={i18next.t("Something went wrong")}
                content={error.message}
                icon="exclamation"
                className="text-align-left"
                negative
              />
            )}
            <Button
              onClick={() => this.closeConfirmModal()}
              floated="left"
              disabled={loading}
              loading={loading}
            >
              {i18next.t("Cancel")}
            </Button>
            <Button
              disabled={this.handleButtonDisabled() || loading}
              negative
              onClick={() => this.handleDelete()}
              loading={loading}
              icon="trash alternate outline"
              content={i18next.t("Remove")}
            />
          </Modal.Actions>
        </Modal>
      </>
    );

    return <CommunityCompactItem actions={action} result={result} />;
  }
}

RecordCommunitiesSearchItemComponent.propTypes = {
  result: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
  /* From React-SearchKit */
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
};

export const RecordCommunitiesSearchItem = withState(
  RecordCommunitiesSearchItemComponent
);
