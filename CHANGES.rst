..
    Copyright (C) 2019-2024 CERN.
    Copyright (C) 2019-2024 Northwestern University.
    Copyright (C) 2021-2024 TU Wien.
    Copyright (C) 2021-2024 Graz University of Technology.

    Invenio App RDM is free software; you can redistribute it and/or modify
    it under the terms of the MIT License; see LICENSE file for more details.

Changes
=======

Version v13.0.0b1.dev27 (released 2025-01-16)

- Revert "config: add record and membership comment notifications"
    * This is actually a breaking change since it introduces a new
      set of notification templates that will potentialy not be
      styled if overridden in an instance's overlay.

Version v13.0.0b1.dev26 (released 2025-01-16)

- config: add record and membership comment notifications
- records/macros/detail.html: Allow funding entry with award number only (#2912)
- records-ui: remove unnecessary p tag in record details
- ui: close unclosed div in header navbar

Version v13.0.0b1.dev24 (released 2024-12-10)

- fix: meta: add missing HighWire authors
- config: add subcommunity comment notifications

Version v13.0.0b1.dev23 (released 2024-11-28)

- assets: use the new copy feature to copy needed TinyMCE static assets

Version v13.0.0b1.dev22 (released 2024-11-28)

- installation: bump invenio-access
    * This removes the invenio-admin dependency.

Version v13.0.0b1.dev21 (released 2024-11-28)

- installation: remove "sentry_sdk" extra from invenio-logging

Version v13.0.0b1.dev20 (released 2024-11-28)

- config: add subcommunity invitation request notifications
- requests: add subcommunity invitation request details page
- creatibutors: added config for identifiers scheme

Version v13.0.0b1.dev15 (released 2024-10-18)

- communities-ui: verified icon display logic change and deterministic sorting

Version v13.0.0b1.dev14 (released 2024-10-18)

- communities-ui: make verified icon display depend on parent community

Version v13.0.0b1.dev13 (released 2024-10-17)

- ui: more space under breadcrumbs
- ui: fixed space between logo and title, number formatting
- ui: updated collection grid styling
- ui: passing collections to communities_home
- community: added verified icon and parent
- landing page: swap username by ID to manage user.

Version v13.0.0b1.dev12 (released 2024-10-16)

- collections: browse page improvements and collection records search pages
- search-ui: added community theme classes to record list items

Version v13.0.0b1.dev11 (released 2024-10-15)

- config: vocabularies Datastream common OpenAIRE

Version v13.0.0b1.dev10 (released 2024-10-10)

- webpack: bump react-searchkit due to axios major upgrade
- setup: bump invenio-search-ui due to axios major upgrade
- assets: fix item description overflow issue
    * addresses mathjax formulas truncation
- browse: fix endpoint name.

Version v13.0.0b1.dev9 (released 2024-10-08)

- installation: bump invenio-communities & invenio-rdm-records

Version v13.0.0b1.dev8 (released 2024-10-04)

- installation: bump invenio-communities & invenio-rdm-records

Version v13.0.0b1.dev7 (released 2024-10-03)

- setup: bump invenio-rdm-records to >=13.0.0
- collections: added minimal UI page
- theme: read invenio config from document body
- search results: render Mathjax in the results list
- records-community: fix error message display when removing a community

Version v13.0.0b1.dev6 (released 2024-09-27)

- communities: create browse communities page
- header_login: Make auth UI accessible
- header_login: Add loader icon when logging in or out
- Revert "deposit: provide permissions to publish button"
- feat: display package version in administration panel

Version v13.0.0b1.dev5 (released 2024-09-25)

- deposit: Add allow-empty-files config available for deposit page
    * Expose `RECORDS_RESOURCES_ALLOW_EMPTY_FILES` for UI control
    * Related to: https://github.com/inveniosoftware/invenio-rdm-records/pull/1802
- deposit: provide permissions to publish button
- config: add group resolver for notifications
- admin-records: add reference to gh issue
- admin-records: account for system owned records
- migration: account for deleted communities and draft concept DOI
- user-dashboard: fixed broken menu padding
- theme: fix accordion rotation
- template: mathjax remove from javascript block
- templates: add mathjax only to parent template
- landing page: support different MathJax delimeters
    * closes https://github.com/CERNDocumentServer/cds-rdm/issues/133
- search-result: namespace overridable id for community search results
- search-result: provide key to part of community array element

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
