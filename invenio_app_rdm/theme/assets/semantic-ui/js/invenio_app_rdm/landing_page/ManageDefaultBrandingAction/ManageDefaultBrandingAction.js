// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import { Button, Message, Popup } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { http, withCancel } from "react-invenio-forms";
import PropTypes from "prop-types";

export class ManageDefaultBrandingAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: undefined,
    };
  }

  componentWillUnmount() {
    this.cancellableAction && this.cancellableAction.cancel();
  }

  handleSetBranding = async (value) => {
    const { recordCommunityEndpoint, updateRecordCallback } = this.props;
    this.setState({ loading: true });

    const payload = {
      default: value,
    };

    this.cancellableAction = withCancel(http.put(recordCommunityEndpoint, payload));

    try {
      const response = await this.cancellableAction.promise;
      this.setState({ loading: false });
      updateRecordCallback(response.data);
    } catch (error) {
      if (error === "UNMOUNTED") return;

      console.error(error);
      this.setState({
        error: error?.response?.data?.message || error?.message,
        loading: false,
      });
    }
  };

  renderCommunity = () => {
    const { loading } = this.state;
    const { result, isCommunityDefault } = this.props;
    const communityTitle = result.metadata.title;

    return isCommunityDefault ? (
      <Popup
        trigger={
          <Button
            size="tiny"
            labelPosition="left"
            icon="paint brush"
            floated="right"
            onClick={() => this.handleSetBranding(null)}
            content={i18next.t("Remove branding")}
            aria-label={i18next.t(
              "{{communityTitle}} is a default branding for this record",
              {
                communityTitle,
              }
            )}
            loading={loading}
          />
        }
        content={i18next.t(
          "Remove this community from appearing on top of the record details page."
        )}
        position="top center"
      />
    ) : (
      <Popup
        trigger={
          <Button
            size="tiny"
            labelPosition="left"
            icon="paint brush"
            floated="right"
            onClick={() => this.handleSetBranding(result.id)}
            content={i18next.t("Set branding")}
            aria-label={i18next.t(
              "Set {{communityTitle}} as a default branding for this record",
              {
                communityTitle,
              }
            )}
            loading={loading}
          />
        }
        content={i18next.t(
          "Set this community to appear on the top of the record details page."
        )}
        position="top center"
      />
    );
  };

  render() {
    const { error } = this.state;
    return error ? (
      <Message
        negative
        floated="right"
        className="community-branding-error"
        size="tiny"
      >
        {error}
      </Message>
    ) : (
      this.renderCommunity()
    );
  }
}

ManageDefaultBrandingAction.propTypes = {
  result: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.object.isRequired,
  updateRecordCallback: PropTypes.func.isRequired,
  isCommunityDefault: PropTypes.bool.isRequired,
};
