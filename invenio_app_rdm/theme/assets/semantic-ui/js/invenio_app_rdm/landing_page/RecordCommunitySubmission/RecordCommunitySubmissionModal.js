import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Message } from "semantic-ui-react";
import { http } from "react-invenio-forms";
import {
  CommunitySelectionModalComponent,
  SubmitReviewModal,
} from "react-invenio-deposit";

export class RecordCommunitySubmissionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmationModalOpen: false,
      selectedCommunity: null,
      loading: false,
      error: null,
    };
  }

  changeSelectedCommunity = (community) => {
    this.setState({
      selectedCommunity: community,
      error: null,
    });
    this.openConfirmModal();
  };

  canDirectPublish = () => {
    const { community } = this.state;
    const { userCommunitiesMemberships } = this.props;
    const userMembership = userCommunitiesMemberships[community?.id];
    return userMembership && community?.access.review_policy === "open";
  };

  handleSuccessSubmit = (data) => {
    const { handleSuccessAction } = this.props;
    this.closeConfirmModal();
    if (this.canDirectPublish()) {
      handleSuccessAction(data, i18next.t("Successful community inclusion"));
    } else handleSuccessAction(data, i18next.t("Review request created"));
  };

  submitCommunity = async () => {
    const { recordCommunityEndpoint } = this.props;
    const { selectedCommunity } = this.state;

    this.setState({
      loading: true,
      error: null,
    });

    try {
      const response = await http.post(recordCommunityEndpoint, {
        communities: [
          {
            id: selectedCommunity.id,
          },
        ],
      });
      this.handleSuccessSubmit(response.data);
    } catch (error) {
      console.error(error);
      this.setState({
        error: error.response.data.errors[0].message,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  openConfirmModal = () => this.setState({ confirmationModalOpen: true });
  closeConfirmModal = () => this.setState({ confirmationModalOpen: false });

  render() {
    const { selectedCommunity, confirmationModalOpen, loading, error } = this.state;
    const { userCommunitiesMemberships, modalOpen, toggleModal } = this.props;
    return (
      <>
        <CommunitySelectionModalComponent
          onCommunityChange={this.changeSelectedCommunity}
          chosenCommunity={selectedCommunity}
          modalOpen={modalOpen}
          userCommunitiesMemberships={userCommunitiesMemberships}
          onModalChange={toggleModal}
          modalHeader={i18next.t("Select a community")}
        />
        {confirmationModalOpen && (
          <SubmitReviewModal
            loading={loading}
            errors={error && <Message error>{error}</Message>}
            isConfirmModalOpen={confirmationModalOpen}
            onSubmit={() => this.submitCommunity()}
            community={selectedCommunity}
            onClose={() => this.closeConfirmModal()}
            directPublish={this.canDirectPublish()}
          />
        )}
      </>
    );
  }
}

RecordCommunitySubmissionModal.propTypes = {
  modalOpen: PropTypes.bool,
  toggleModal: PropTypes.func.isRequired,
  userCommunitiesMemberships: PropTypes.object.isRequired,
  handleSuccessAction: PropTypes.func.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
};

RecordCommunitySubmissionModal.defaultProps = {
  modalOpen: false,
};
