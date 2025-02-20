// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { TimelineFeedHeader } from "../requests/timeline/overrides/TimelineFeedHeader";

export const overriddenComponents = {
  // Guest Access Request customisation
  "TimelineFeed.header": TimelineFeedHeader,
};
