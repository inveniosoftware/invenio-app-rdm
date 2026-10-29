/*
 * SPDX-FileCopyrightText: 2023-2025 CERN.
 * SPDX-License-Identifier: MIT
 */

import { RemoveFromCommunityAction } from "../RemoveFromCommunity/RemoveFromCommunityAction";
import { Component } from "react";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import PropTypes from "prop-types";
import { ManageDefaultBrandingAction } from "../ManageDefaultBrandingAction/ManageDefaultBrandingAction";

const DEFAULT_RECORD_REQUESTS = {};

export class RecordCommunitiesSearchItem extends Component {
  render() {
    const {
      result,
      successCallback,
      updateRecordCallback,
      recordCommunityEndpoint,
      recordParent,
      permissions: {
        can_manage: canManage,
        removable_community_ids: removableCommunityIds,
      },
      recordRequests = DEFAULT_RECORD_REQUESTS,
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
          canRemoveCommunity={removableCommunityIds?.includes(result?.id)}
        />
      </>
    );
    return (
      <CommunityCompactItem
        actions={actions}
        result={result}
        isCommunityDefault={isCommunityDefault}
        recordRequests={recordRequests}
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
  recordRequests: PropTypes.object,
};
