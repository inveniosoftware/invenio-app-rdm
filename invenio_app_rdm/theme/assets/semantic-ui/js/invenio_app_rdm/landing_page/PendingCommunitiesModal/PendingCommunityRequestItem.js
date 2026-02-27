import React, { Component } from "react";
import PropTypes from "prop-types";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import { RequestActionController } from "@js/invenio_requests";

export class PendingCommunityRequestItem extends Component {
  render() {
    const { result, successCallback } = this.props;
    const {
      expanded: { receiver: community },
      links: { self_html: requestLinkSelf },
    } = result;
    const actions = (
      <RequestActionController
        request={result}
        actionSuccessCallback={successCallback}
      />
    );
    return (
      <CommunityCompactItem
        result={community}
        actions={actions}
        detailUrl={requestLinkSelf}
      />
    );
  }
}

PendingCommunityRequestItem.propTypes = {
  result: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};
