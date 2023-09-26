import { RemoveFromCommunityAction } from "../RemoveFromCommunity/RemoveFromCommunityAction";
import React, { Component } from "react";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import PropTypes from "prop-types";
import { ManageDefaultBrandingAction } from "../ManageDefaultBrandingAction/ManageDefaultBrandingAction";

export class RecordCommunitiesSearchItem extends Component {
  render() {
    const {
      result,
      successCallback,
      updateRecordCallback,
      recordCommunityEndpoint,
      recordParent,
      permissions: { can_manage: canManage },
    } = this.props;

    const isCommunityDefault = recordParent?.communities?.default === result?.id;
    const actions = canManage && (
      <>
        <ManageDefaultBrandingAction
          result={result}
          recordCommunityEndpoint={recordCommunityEndpoint}
          updateRecordCallback={updateRecordCallback}
          isCommunityDefault={isCommunityDefault}
        />
        <RemoveFromCommunityAction
          result={result}
          recordCommunityEndpoint={recordCommunityEndpoint}
          successCallback={successCallback}
        />
      </>
    );
    return (
      <CommunityCompactItem
        actions={actions}
        result={result}
        isCommunityDefault={isCommunityDefault}
      />
    );
  }
}

RecordCommunitiesSearchItem.propTypes = {
  result: PropTypes.object.isRequired,
  recordCommunityEndpoint: PropTypes.string.isRequired,
  successCallback: PropTypes.func.isRequired,
  updateRecordCallback: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
  recordParent: PropTypes.object.isRequired,
};
