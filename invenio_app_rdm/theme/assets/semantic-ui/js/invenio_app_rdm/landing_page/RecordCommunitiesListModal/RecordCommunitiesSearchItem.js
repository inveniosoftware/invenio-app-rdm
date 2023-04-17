import { RemoveFromCommunityAction } from "../RemoveFromCommunity/RemoveFromCommunityAction";
import React, { Component } from "react";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import PropTypes from "prop-types";

export class RecordCommunitiesSearchItem extends Component {
  render() {
    const {
      result,
      successCallback,
      recordCommunityEndpoint,
      permissions: { can_manage: canManage },
    } = this.props;

    const actions = canManage && (
      <RemoveFromCommunityAction
        result={result}
        recordCommunityEndpoint={recordCommunityEndpoint}
        successCallback={successCallback}
      />
    );
    return <CommunityCompactItem actions={actions} result={result} />;
  }
}

RecordCommunitiesSearchItem.propTypes = {
  result: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  successCallback: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
};
