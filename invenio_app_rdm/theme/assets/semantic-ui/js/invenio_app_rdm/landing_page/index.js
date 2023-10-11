// This file is part of InvenioRDM
// Copyright (C) 2020-2021 CERN.
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
import { OverridableContext, overrideStore } from "react-overridable";

const recordManagementAppDiv = document.getElementById("recordManagement");
const recordManagementMobile = document.getElementById("recordManagementMobile");

const recordVersionsAppDiv = document.getElementById("recordVersions");
const recordCitationAppDiv = document.getElementById("recordCitation");
const recordExportDownloadDiv = document.getElementById("recordExportDownload");
const sidebarCommunitiesManageDiv = document.getElementById(
  "sidebar-communities-manage"
);

if (recordManagementAppDiv) {
  renderRecordManagement(recordManagementAppDiv);
  recordManagementMobile && renderRecordManagement(recordManagementMobile);
}

function renderRecordManagement(element) {
  ReactDOM.render(
    <OverridableContext.Provider value={overrideStore.getAll()}>
      <RecordManagement
        record={JSON.parse(recordManagementAppDiv.dataset.record)}
        permissions={JSON.parse(recordManagementAppDiv.dataset.permissions)}
        isDraft={JSON.parse(recordManagementAppDiv.dataset.isDraft)}
        isPreviewSubmissionRequest={JSON.parse(
          recordManagementAppDiv.dataset.isPreviewSubmissionRequest
        )}
        currentUserId={recordManagementAppDiv.dataset.currentUserId}
        recordOwnerUsername={recordManagementAppDiv.dataset.recordOwnerUsername}
        accessLinksSearchConfig={JSON.parse(
          recordManagementAppDiv.dataset.accessLinksSearchConfig
        )}
      />
    </OverridableContext.Provider>,
    element
  );
}

if (recordVersionsAppDiv) {
  ReactDOM.render(
    <RecordVersionsList
      record={JSON.parse(recordVersionsAppDiv.dataset.record)}
      isPreview={JSON.parse(recordVersionsAppDiv.dataset.preview)}
    />,
    recordVersionsAppDiv
  );
}

if (recordCitationAppDiv) {
  ReactDOM.render(
    <RecordCitationField
      record={JSON.parse(recordCitationAppDiv.dataset.record)}
      styles={JSON.parse(recordCitationAppDiv.dataset.styles)}
      defaultStyle={JSON.parse(recordCitationAppDiv.dataset.defaultstyle)}
      includeDeleted={JSON.parse(recordCitationAppDiv.dataset.includeDeleted)}
    />,
    recordCitationAppDiv
  );
}

if (recordExportDownloadDiv) {
  ReactDOM.render(
    <ExportDropdown formats={JSON.parse(recordExportDownloadDiv.dataset.formats)} />,
    recordExportDownloadDiv
  );
}

if (sidebarCommunitiesManageDiv) {
  const recordCommunitySearchConfig = JSON.parse(
    sidebarCommunitiesManageDiv.dataset.recordCommunitySearchConfig
  );
  const pendingCommunitiesSearchConfig =
    sidebarCommunitiesManageDiv.dataset.pendingCommunitiesSearchConfig;
  ReactDOM.render(
    <CommunitiesManagement
      userCommunitiesMemberships={JSON.parse(
        sidebarCommunitiesManageDiv.dataset.userCommunitiesMemberships
      )}
      recordCommunityEndpoint={
        sidebarCommunitiesManageDiv.dataset.recordCommunityEndpoint
      }
      recordUserCommunitySearchConfig={JSON.parse(
        sidebarCommunitiesManageDiv.dataset.recordUserCommunitySearchConfig
      )}
      canManageRecord={JSON.parse(sidebarCommunitiesManageDiv.dataset.canManageRecord)}
      recordCommunitySearchConfig={recordCommunitySearchConfig}
      permissions={JSON.parse(sidebarCommunitiesManageDiv.dataset.permissions)}
      searchConfig={JSON.parse(pendingCommunitiesSearchConfig)}
      record={JSON.parse(recordCitationAppDiv.dataset.record)}
    />,
    sidebarCommunitiesManageDiv
  );
}
