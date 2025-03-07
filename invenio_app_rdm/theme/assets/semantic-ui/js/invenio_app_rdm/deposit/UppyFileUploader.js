// This file is part of InvenioRDM
// Copyright (C) 2020-2024 CERN.
// Copyright (C) 2020-2025 CESNET.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more

import { getInputFromDOM } from '@js/invenio_rdm_records';
import { UppyDepositFileApiClient, UppyDepositFilesService, UppyUploader } from '@inveniosoftware/invenio-files-uppy';

const {apiHeaders, default_transfer_type: defaultTransferType, fileUploadConcurrency} = getInputFromDOM("deposits-config");

if (window.invenio) {
  const uppyFilesApiClient = new UppyDepositFileApiClient({ apiHeaders }, defaultTransferType);
  const uppyFilesService = new UppyDepositFilesService(uppyFilesApiClient, fileUploadConcurrency);

  window.invenio.files = {
    apiClient: uppyFilesApiClient,
    service: uppyFilesService,
    uploaderComponent: UppyUploader,
  };
}
