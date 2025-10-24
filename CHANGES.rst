..
    Copyright (C) 2019-2025 CERN.
    Copyright (C) 2019-2024 Northwestern University.
    Copyright (C) 2021-2024 TU Wien.
    Copyright (C) 2021-2025 Graz University of Technology.

    Invenio App RDM is free software; you can redistribute it and/or modify
    it under the terms of the MIT License; see LICENSE file for more details.

Changes
=======

Version v14.0.0b2.dev2 (released 2025-10-24)

- upgrade_scripts: v14: optimize scan to avoid scroll context overhead

Version v14.0.0b2.dev1 (released 2025-10-21)

- deposit-form: updated related works options vocab

Version v14.0.0b2.dev0 (released 2025-10-21)

- installation: bump invenio-rdm-records
- upgrade_scripts: Add v13 to v14 migration script
- ui: add new related identifiers to vocabulary
- ui: format numbers in CompactStats
- fix(macros): Fix custom fields vocabularies links on landing page
- fix(admin): use configured base template instead of hard-coded value

Version v14.0.0b1.dev5 (released 2025-10-14)

- fix(community-submission): add missing var in side bar template
- fix(guest-access-request): handle broken expiration date payload value
    * this extra check prevents the request timeline UI from breaking when a
      request payload has a broken value, to make recovery easier
    * also, make eslint happy with a camel case variable name
- fix(guest-access-request): handle more possible expiration date values
    * when the expiration date gets submitted, the value of the empty input
      field is typically the empty string rather than `null`
    * on the reading side, handle the case that the expiration date is set
      as a string value (since request payloads are generally strings)

Version v14.0.0b1.dev4 (released 2025-10-03)

- installation: relax invenio-collections dependency requirements
    * see https://github.com/inveniosoftware/invenio-app-rdm/issues/3194

Version v14.0.0b1.dev3 (released 2025-10-01)

- fix(deposit-ui): read expanded published record
    * The UI serializer requires the expanded record service result.
- feat(config): add last activity sort option

Version v14.0.0b1.dev2 (released 2025-09-29)

- fix(deposit-ui): use API record for evaluating deletion policy

Version v14.0.0b1.dev1 (released 2025-09-24)

- Fixed CHANGES.rst formatting

Version v14.0.0b1.dev0 (released 2025-09-24)

- feat(administration): add Requests view
- feat: add record deletion requests
    * Allows to configure record deletion policies for immediate deletion
      or going through a request flow on the record landing page.

Version v14.0.0b0.dev4 (released 2025-09-01)

- views(deposit): pass to the form config the published record if we edit one
    * The published record is used to compare published DOI but it can be
      used also to compare with the published state of an editing draft.
- help: correct search instructions for missing fields

Version v14.0.0b0.dev3 (released 2025-08-26)

- fix(community-requests): request permissions were missing from UI
    * The community requests page was not showing the request reviewers section
      because the permissions were not passed to the template.

Version v14.0.0b0.dev2 (released 2025-08-08)

- fix(views): use correct community value
    * After the change in 33f1b0d2, values passed to the UI or used for
      accessing UI-related attributes (e.g. the "theme"), must come from
      the community UI-serialized value instead of the service result item.
- fix(pages): add community base template as a valid option
- feat(fixtures): allow specifying `template_name` in page fixtures
- ui: refactor record injecting in JS components
    - inject only record links in citations cmps
    - remove dependency between citations and communities cmps which
      they were sharing the same record injection
- fix(deposits): pass missing community_ui to community theme templates
    * also introduce more explicit distinctions between community and
      community_ui variables
- UI: set order of entries and rename category to deposits
- UI: make external resources section consistent with details
- UI: make rights section consistent with details

Version v14.0.0b0.dev1 (released 2025-08-01)

- setup: bump invenio-communities and invenio-rdm-records
- theme: add search overrides for reviewers search results
- requests: add request action_accept permissions to UI
- theme: update package-lock.json for compiling catalog for frontend tests

Version v13.0.0b4.dev2 (released 2025-06-13)

- checks: integrate into community requests flow
- deposit-ui: pass draft errors to form
- landing page: text-break references
- ui: fixed caret trigger in stats

- deposit: report actual file quota rather than configured values
    * previously, the deposit form would show values from the configuration
      that might be different from the actually effective quota


Version v13.0.0b4.dev1 (released 2025-06-10)

- communities-ui: pass locale language when rendering static pages
- deposit UI: add overridable hook for a separate section

Version v13.0.0b4.dev0 (released 2025-06-04)

- setup: bump major dependencies
- change: add internationalized page creation
- details: pass scheme on related identifiers url generator

Version v13.0.0b3.dev18 (released 2025-06-02)

- installation: add collections dependency
- views: rename record_ui correctly

Version v13.0.0b3.dev17 (released 2025-06-02)

- Move collections implementaiton to Invenio-Collections
- Integrate Invenio-Sitemap

Version v13.0.0b3.dev16 (released 2025-05-23)

- administration: audit_logs: Add View Changes and View Log button and modals

Version v13.0.0b3.dev15 (released 2025-05-23)

- Revert "views: pass record object to record details"

Version v13.0.0b3.dev14 (released 2025-05-23)

- views: pass record object to record details

Version v13.0.0b3.dev13 (released 2025-05-21)

- jinja: remove hardcoded template imports

Version v13.0.0b3.dev12 (released 2025-05-21)

- jinja: add config attributes to record detail
- beat: add delete job logs recurrent task

Version v13.0.0b3.dev11 (released 2025-05-16)

- deposit-ui: add "files.entries" to files section

Version v13.0.0b3.dev10 (released 2025-05-16)

- fixtures: make content template optional
- MathJax: add typesetting to the citations box

Version v13.0.0b3.dev9 (released 2025-05-15)

- recordManagment: pass permissiosn down to overridable

Version v13.0.0b3.dev8 (released 2025-05-15)

- MathJax: use async typesetting

Version v13.0.0b3.dev7 (released 2025-05-08)

- fix: community request page missing context variable

Version v13.0.0b3.dev6 (released 2025-05-07)

- records-ui: add error handler for NoResultFound exceptions
- tests: add tests for draft file download with and without preview flag
- i18n: mark string for translation
- urls: integrate link generation (invenio_url_for)
- templates: add thesis details display
- administration: Add Audit Logs Admin Panel UI (experimental feature, behind a flag)

Version v13.0.0b3.dev5 (released 2025-04-25)

- deposit: add copyright field
- landing page: bugfix for user avatars

Version v13.0.0b3.dev4 (released 2025-04-10)

- deposits: use optional doi validator method

Version v13.0.0b3.dev3 (released 2025-04-04)

- fix: Handle undefined record attributes in templates to avoid rendering errors (#2932)
- communities_ui: make routes + views configurable
- views: extract create_url_rule utility and plan for deprecation


Version v13.0.0b3.dev2 (released 2025-03-29)

- fix: restore messages index.js and remove unused imports

Version v13.0.0b3.dev1 (released 2025-03-27)

- deposit: align licenses modal with funders modal

Version v13.0.0b3.dev0 (released 2025-03-26)

- thesis: breaking change in thesis field (invenio-rdm-records)
- thesis: add university and type field
- imprint: add edition field

Version v13.0.0b2.dev11 (released 2025-03-26)

- checks: add checks tab to requests (fix template inclusion)

Version v13.0.0b2.dev10 (released 2025-03-26)

- checks: add checks tab to requests
- theme: fix responsive breakpoints for low resolution screens

Version v13.0.0b2.dev9 (released 2025-03-21)

- (Empty release to trigger fixed PyPI publish GitHub action)

Version v13.0.0b2.dev8 (released 2025-03-21)

- config: updated severity label text on deposit form

Version v13.0.0b2.dev7 (released 2025-03-18)

- deposit: refactor section config in RDMDepositForm
    - added anchor ids, made form overridable
    - added section path in config
    - added styling for error messages
    - added severity checks config
    - added css for accordion labels

Version v13.0.0b2.dev6 (released 2025-03-12)

- dashboard: enable shared filters for requests

Version v13.0.0b2.dev5 (released 2025-03-11)

- dashboard: use always view button to redirect user to the upload
    - If upload is published redirect user to published record
    - If upload is draft redirect user to upload or preview depending on their permission
- deposit: use permissions.can_manage for record community management
- dashboard: split mine and shared with me uploads

Version v13.0.0b2.dev4 (released 2025-03-10)

- views: FAIR signposting level 1 support (config flag)
- tasks: skip health checks for files that don't have a uri
- views: signposting: files: fix filename encoding issues for downloads

Version v13.0.0b2.dev3 (released 2025-02-21)

- views: FAIR signposting level 1 support
- meta: FAIR signposting level 1 support (link rel item)
- globals: site.overrides: Increase pdf preview iframe height
- tests: fix mock module paths
- tests: add __init__.py in all directories
    * This is necessary for pytest v8.x to be able to detect all unique
      tests.

- tests: filter out excessive warnings
- fix: flask changed to TRUSTED_HOSTS

Version v13.0.0b2.dev2 (released 2025-02-13)

- Bump prerelease dependencies to stable.

Version v13.0.0b2.dev1 (released 2025-01-23)

Version v13.0.0b2.dev0 (released 2024-12-16)

- setup: remove flask pin
- setup: change to reusable workflows
- setup: bump major dependencies

Version v13.0.0b1.dev30 (released 2025-01-27)

- administration: add record revision comparison

Version v13.0.0b1.dev29 (released 2025-01-23)

- preview: do not mint parent doi if doi is not reserved and doi is optional

Version v13.0.0b1.dev28 (released 2025-01-21)

- pids: pass optional DOI transitions in the upload form
- deposit: force no caching in the response headers

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
