// This file is part of InvenioRDM
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { DepositController } from "../../../react_invenio_deposit";

export class RDMDepositController extends DepositController {
  constructor(apiClient) {
    super(apiClient);
    console.log("RDM Deposit Controller");
  }
}
