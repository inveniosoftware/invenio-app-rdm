// This file is part of InvenioRDM
// Copyright (C) 2020-2025 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2023 TU Wien.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import ReactDOM from "react-dom";
import { RecordManagement } from "./RecordManagement";
import { RecordVersionsList } from "./RecordVersionsList";
import { RecordCitationField } from "./RecordCitationField";
import { ExportDropdown } from "./ExportDropdown";
import { CommunitiesManagement } from "./CommunitiesManagement";
import Overridable, { OverridableContext, overrideStore } from "react-overridable";

const overriddenComponents = overrideStore.getAll();

const recordManagementAppDiv = document.getElementById("recordManagement");
const recordManagementMobile = document.getElementById("recordManagementMobile");
if (recordManagementAppDiv) {
  renderRecordManagement(recordManagementAppDiv);
  recordManagementMobile && renderRecordManagement(recordManagementMobile);
}

function renderRecordManagement(element) {
  const record = JSON.parse(recordManagementAppDiv.dataset.record);
  ReactDOM.render(
    <OverridableContext.Provider value={overriddenComponents}>
      <RecordManagement
        record={record}
        permissions={JSON.parse(recordManagementAppDiv.dataset.permissions)}
        isDraft={JSON.parse(recordManagementAppDiv.dataset.isDraft)}
        isPreviewSubmissionRequest={JSON.parse(
          recordManagementAppDiv.dataset.isPreviewSubmissionRequest
        )}
        currentUserId={recordManagementAppDiv.dataset.currentUserId}
        recordOwnerID={record.parent.access.owned_by.user}
        groupsEnabled={JSON.parse(recordManagementAppDiv.dataset.groupsEnabled)}
        recordDeletion={JSON.parse(recordManagementAppDiv.dataset.recordDeletion)}
      />
    </OverridableContext.Provider>,
    element
  );
}

const recordVersionsAppDiv = document.getElementById("recordVersions");
if (recordVersionsAppDiv) {
  ReactDOM.render(
    <RecordVersionsList
      record={JSON.parse(recordVersionsAppDiv.dataset.record)}
      isPreview={JSON.parse(recordVersionsAppDiv.dataset.preview)}
    />,
    recordVersionsAppDiv
  );
}

const recordCitationAppDiv = document.getElementById("recordCitation");
if (recordCitationAppDiv) {
  ReactDOM.render(
    <RecordCitationField
      recordLinks={JSON.parse(recordCitationAppDiv.dataset.recordLinks)}
      styles={JSON.parse(recordCitationAppDiv.dataset.styles)}
      defaultStyle={JSON.parse(recordCitationAppDiv.dataset.defaultstyle)}
      includeDeleted={JSON.parse(recordCitationAppDiv.dataset.includeDeleted)}
    />,
    recordCitationAppDiv
  );
}

const recordExportDownloadDiv = document.getElementById("recordExportDownload");
if (recordExportDownloadDiv) {
  ReactDOM.render(
    <ExportDropdown formats={JSON.parse(recordExportDownloadDiv.dataset.formats)} />,
    recordExportDownloadDiv
  );
}

const sidebarCommunitiesManageDiv = document.getElementById(
  "sidebar-communities-manage"
);
if (sidebarCommunitiesManageDiv) {
  const userCommunitiesMemberships = JSON.parse(
    sidebarCommunitiesManageDiv.dataset.userCommunitiesMemberships
  );
  const recordCommunityEndpoint =
    sidebarCommunitiesManageDiv.dataset.recordCommunityEndpoint;
  const recordCommunitySearchConfig = JSON.parse(
    sidebarCommunitiesManageDiv.dataset.recordCommunitySearchConfig
  );
  const recordUserCommunitySearchConfig = JSON.parse(
    sidebarCommunitiesManageDiv.dataset.recordUserCommunitySearchConfig
  );
  const pendingCommunitiesSearchConfig = JSON.parse(
    sidebarCommunitiesManageDiv.dataset.pendingCommunitiesSearchConfig
  );
  const permissions = JSON.parse(sidebarCommunitiesManageDiv.dataset.permissions);
  const record = JSON.parse(sidebarCommunitiesManageDiv.dataset.record);
  ReactDOM.render(
    <OverridableContext.Provider value={overriddenComponents}>
      <Overridable
        id="InvenioAppRdm.RecordLandingPage.CommunitiesManagement.container"
        userCommunitiesMemberships={userCommunitiesMemberships}
        recordCommunityEndpoint={recordCommunityEndpoint}
        recordUserCommunitySearchConfig={recordUserCommunitySearchConfig}
        recordCommunitySearchConfig={recordCommunitySearchConfig}
        permissions={permissions}
        searchConfig={pendingCommunitiesSearchConfig}
        record={record}
      >
        <CommunitiesManagement
          userCommunitiesMemberships={userCommunitiesMemberships}
          recordCommunityEndpoint={recordCommunityEndpoint}
          recordUserCommunitySearchConfig={recordUserCommunitySearchConfig}
          recordCommunitySearchConfig={recordCommunitySearchConfig}
          permissions={permissions}
          searchConfig={pendingCommunitiesSearchConfig}
          record={record}
        />
      </Overridable>
    </OverridableContext.Provider>,
    sidebarCommunitiesManageDiv
  );
}
