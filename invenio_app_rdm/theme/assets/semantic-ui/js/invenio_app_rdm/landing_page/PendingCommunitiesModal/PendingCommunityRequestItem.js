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
    const requestLink = requestLinkSelf.replace("/requests", "/me/requests"); //We should use self_html once the following issue is fixed: https://github.com/inveniosoftware/invenio-requests/issues/332
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
        detailUrl={requestLink}
      />
    );
  }
}

PendingCommunityRequestItem.propTypes = {
  result: PropTypes.object.isRequired,
  successCallback: PropTypes.func.isRequired,
};
