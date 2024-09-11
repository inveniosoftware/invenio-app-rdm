..
    Copyright (C) 2019-2024 CERN.
    Copyright (C) 2019-2024 Northwestern University.
    Copyright (C) 2021-2024 TU Wien.
    Copyright (C) 2021-2024 Graz University of Technology.

    Invenio App RDM is free software; you can redistribute it and/or modify
    it under the terms of the MIT License; see LICENSE file for more details.

Changes
=======

Version v13.0.0b1.dev4 (released 2024-09-11)

- deposit: fix adding a record to a community
- config: make OAI-PMH record index dynamic

Version v13.0.0b1.dev3 (released 2024-09-02)

- deposit: renamed get quota function
- config: filter out robots and flag machines
- migration: mint the new concept DOI for each upgraded record
    * previously, the script would create a new concept DOI for each record
      but never actually mint them on DataCite

Version v13.0.0b1.dev2 (released 2024-08-27)

- setup: bump invenio-communities

Version v13.0.0b1.dev1 (released 2024-08-27)

- ui: ccount for system created records in share modal
- config: add subjects datastream config
- tests: use opensearch2

Version v13.0.0b1.dev0 (released 2024-08-22)

- search: improve search results for records, users and affiliations
- ui: display creators roles in records landing page

Version v13.0.0b0.dev14 (released 2024-08-22)

- migrate to v12: emit non-zero exit code on error
- config: import affiliations vocabulary readers
- package: bump react-invenio-forms
- DepositForm: Add searchOnFocus prop to subjects RemoteSelectField

Version 10.0.0 (released 2022-10-10)

Version 7.0.0 (released 2021-12-06)
