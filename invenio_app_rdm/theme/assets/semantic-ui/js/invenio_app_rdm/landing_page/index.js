/*
 * SPDX-FileCopyrightText: 2020-2026 CERN.
 * SPDX-FileCopyrightText: 2020-2021 Northwestern University.
 * SPDX-FileCopyrightText: 2021 Graz University of Technology.
 * SPDX-FileCopyrightText: 2023 TU Wien.
 * SPDX-License-Identifier: MIT
 */

import { createRoot } from "react-dom/client";
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
  createRoot(element).render(
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
        recordDeletionOptions={JSON.parse(
          recordManagementAppDiv.dataset.recordDeletionOptions
        )}
        auditLogsEnabled={JSON.parse(recordManagementAppDiv.dataset.auditLogsEnabled)}
      />
    </OverridableContext.Provider>
  );
}

const recordVersionsAppDiv = document.getElementById("recordVersions");
if (recordVersionsAppDiv) {
  createRoot(recordVersionsAppDiv).render(
    <OverridableContext.Provider value={overriddenComponents}>
      <RecordVersionsList
        record={JSON.parse(recordVersionsAppDiv.dataset.record)}
        isPreview={JSON.parse(recordVersionsAppDiv.dataset.preview)}
      />
    </OverridableContext.Provider>
  );
}

const recordCitationAppDiv = document.getElementById("recordCitation");
if (recordCitationAppDiv) {
  createRoot(recordCitationAppDiv).render(
    <RecordCitationField
      recordLinks={JSON.parse(recordCitationAppDiv.dataset.recordLinks)}
      styles={JSON.parse(recordCitationAppDiv.dataset.styles)}
      defaultStyle={JSON.parse(recordCitationAppDiv.dataset.defaultstyle)}
      includeDeleted={JSON.parse(recordCitationAppDiv.dataset.includeDeleted)}
    />
  );
}

const recordExportDownloadDiv = document.getElementById("recordExportDownload");
if (recordExportDownloadDiv) {
  createRoot(recordExportDownloadDiv).render(
    <ExportDropdown formats={JSON.parse(recordExportDownloadDiv.dataset.formats)} />
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
  const recordRequests = JSON.parse(sidebarCommunitiesManageDiv.dataset.recordRequests);
  createRoot(sidebarCommunitiesManageDiv).render(
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
        recordRequests={recordRequests}
      >
        <CommunitiesManagement
          userCommunitiesMemberships={userCommunitiesMemberships}
          recordCommunityEndpoint={recordCommunityEndpoint}
          recordUserCommunitySearchConfig={recordUserCommunitySearchConfig}
          recordCommunitySearchConfig={recordCommunitySearchConfig}
          permissions={permissions}
          searchConfig={pendingCommunitiesSearchConfig}
          record={record}
          recordRequests={recordRequests}
        />
      </Overridable>
    </OverridableContext.Provider>
  );
}
